const ldap = require('ldapjs');
const pool = require("./db");
const jwt = require('jsonwebtoken');

const ldapurl = `ldap://${process.env.LDAP_HOST}:${process.env.LDAP_PORT}`;

const ldapClient = ldap.createClient({
    url: ldapurl,
    timeout: 5000,
    connectTimeout: 10000,
});

function authenticateUser(username, password, response) {
    const baseDN = process.env.LDAP_BASE_DN; // dc=example,dc=com
    const bindDN = process.env.LDAP_BIND_DN; // cn=ldap-reader,cn=Users,dc=example,dc=com
    const bindPassword = process.env.LDAP_BIND_PASSWORD;

    // First, bind as the service account to perform the search
    ldapClient.bind(bindDN, bindPassword, (err) => {
        if (err) {
            console.error('Service account bind failed:', err);
            return response.json({message: 'Authentication service unavailable', status: 401});
        }

        // Search for the user in Active Directory
        const searchOptions = {
            filter: `(&(objectClass=user)(sAMAccountName=${username}))`,
            scope: 'sub',
            attributes: ['dn', 'sAMAccountName', 'cn', 'memberOf', 'distinguishedName'],
        };

        ldapClient.search(baseDN, searchOptions, (err, res) => {
            if (err) {
                console.error('Search failed:', err);
                return response.json({message: 'User search failed', status: 500});
            }

            let userDN = null;
            let userOrganization = null;
            let userGroups = [];

            res.on('searchEntry', (entry) => {
                const attributes = entry.pojo.attributes;
                userDN = attributes.find(attr => attr.type === 'distinguishedName')?.values[0];
                
                // Get memberOf groups
                const memberOfAttr = attributes.find(attr => attr.type === 'memberOf');
                if (memberOfAttr) {
                    userGroups = memberOfAttr.values;
                }

                // Determine organization from DN or groups
                userOrganization = determineOrganization(userDN, userGroups);
            });

            res.on('end', () => {
                if (!userDN) {
                    console.log('User not found in Active Directory.');
                    return response.json({message: 'Invalid credentials', status: 401});
                }

                if (!userOrganization) {
                    console.log('User does not belong to TIC or OOPP organization.');
                    return response.json({message: 'Access denied - invalid organization', status: 403});
                }

                // Now authenticate the user with their actual credentials
                authenticateUserCredentials(userDN, password, username, userOrganization, userGroups, response);
            });

            res.on('error', (err) => {
                console.error('Search error:', err);
                return response.json({message: 'Search error', status: 500});
            });
        });
    });
}

function determineOrganization(userDN, userGroups) {
    // Check if user is in TIC or OOPP based on DN or group membership
    if (userDN.includes('OU=TIC') || userGroups.some(group => group.includes('TIC'))) {
        return 'TIC';
    } else if (userDN.includes('OU=OOPP') || userGroups.some(group => group.includes('OOPP'))) {
        return 'OOPP';
    }
    
    // Fallback: check groups for organization indicators
    for (const group of userGroups) {
        if (group.toLowerCase().includes('tic')) {
            return 'TIC';
        } else if (group.toLowerCase().includes('oopp')) {
            return 'OOPP';
        }
    }
    
    return null;
}

function authenticateUserCredentials(userDN, password, username, organization, userGroups, response) {
    // Create a new client for user authentication
    const authClient = ldap.createClient({
        url: ldapurl,
        timeout: 5000,
        connectTimeout: 10000,
    });

    // Try to bind with user credentials
    authClient.bind(userDN, password, async (err) => {
        if (err) {
            console.error('User authentication failed:', err);
            authClient.unbind();
            return response.json({message: 'Invalid credentials', status: 401});
        }

        console.log('User authentication successful!');
        
        // Determine user role from AD groups
        const role = getUserRoleFromGroups(userGroups, organization);
        
        console.log(`User ${username} is a ${role} in ${organization}.`);

        try {
            // Check if user exists in database, if not create them
            const [user] = await pool.query('SELECT * FROM users WHERE name = ?', [username]);
            const [department] = await pool.query('SELECT id FROM departments WHERE name = ?', [organization]);
            
            let payload = {};
            if (user.length === 0) {
                const [result] = await pool.query('INSERT INTO users (name, role, department_id) VALUES (?, ?, ?)', [username, role, department[0].id]);
                payload = {username: username, role: role, department: organization, id: result.insertId};
            } else {
                // Update user role in case it changed in AD
                await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, user[0].id]);
                payload = {username: username, role: role, department: organization, id: user[0].id};
            }
            
            const token = jwt.sign(payload, process.env.JWT_SECRET, role === 'Admin' ? {} : {expiresIn: '1h'});
            response.cookie('token', token, {
                httpOnly: true, 
                sameSite: 'strict', 
                maxAge: role === 'Admin' ? undefined : 3600000
            });
            
            authClient.unbind();
            return response.json({message: 'Login successful!', role: role, status: 200});
            
        } catch (dbError) {
            console.error('Database error:', dbError);
            authClient.unbind();
            return response.json({message: 'Database error during login', status: 500});
        }
    });
}

function getUserRoleFromGroups(userGroups, organization) {
    const adminGroups = process.env.LDAP_ADMIN_GROUPS?.split(';') || [];
    
    // Check if user is in admin groups
    for (const adminGroup of adminGroups) {
        if (userGroups.some(group => group.includes(adminGroup))) {
            return 'Admin';
        }
    }
    
    // Fallback: check for common admin group patterns
    const adminPatterns = ['admin', 'administrator', 'manager'];
    for (const group of userGroups) {
        const groupLower = group.toLowerCase();
        if (adminPatterns.some(pattern => groupLower.includes(pattern)) && 
            groupLower.includes(organization.toLowerCase())) {
            return 'Admin';
        }
    }
    
    return 'User';
}

// Handle client errors and reconnection
ldapClient.on('error', (err) => {
    console.error('LDAP Client Error:', err);
});

ldapClient.on('connect', () => {
    console.log('Connected to Active Directory');
});

module.exports = authenticateUser;