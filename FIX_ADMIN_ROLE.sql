-- Check current admin user role
SELECT Id, Name, Email, RoleId, IsActive 
FROM Users 
WHERE Email = 'admin@gmail.com';

-- Update admin user to have roleId = 0 (Admin)
UPDATE Users 
SET RoleId = 0 
WHERE Email = 'admin@gmail.com';

-- Verify the update
SELECT Id, Name, Email, RoleId, IsActive 
FROM Users 
WHERE Email = 'admin@gmail.com';

-- Expected result: RoleId should be 0
