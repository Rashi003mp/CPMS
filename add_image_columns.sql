-- Add ImageUrl and ImagePublicId columns to Projects table
-- These columns are nullable to preserve existing data

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Projects]') AND name = 'ImageUrl')
BEGIN
    ALTER TABLE [dbo].[Projects]
    ADD [ImageUrl] NVARCHAR(MAX) NULL;
    PRINT 'ImageUrl column added successfully';
END
ELSE
BEGIN
    PRINT 'ImageUrl column already exists';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Projects]') AND name = 'ImagePublicId')
BEGIN
    ALTER TABLE [dbo].[Projects]
    ADD [ImagePublicId] NVARCHAR(MAX) NULL;
    PRINT 'ImagePublicId column added successfully';
END
ELSE
BEGIN
    PRINT 'ImagePublicId column already exists';
END
