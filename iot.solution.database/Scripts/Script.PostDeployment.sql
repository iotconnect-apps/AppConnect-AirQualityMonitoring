IF NOT EXISTS (SELECT TOP 1 1 FROM dbo.[configuration] WHERE [configKey] = 'db-version')
BEGIN
	INSERT [dbo].[Configuration] ([guid], [configKey], [value], [isDeleted], [createdDate], [createdBy], [updatedDate], [updatedBy]) 
	VALUES (N'cf45da4c-1b49-49f5-a5c3-8bc29c1999ea', N'db-version', N'0', 0, GETUTCDATE(), NULL, GETUTCDATE(), NULL)
END

IF NOT EXISTS (SELECT TOP 1 1 FROM dbo.[configuration] WHERE [configKey] = 'telemetry-last-exectime')
BEGIN
	INSERT [dbo].[Configuration] ([guid], [configKey], [value], [isDeleted], [createdDate], [createdBy], [updatedDate], [updatedBy]) 
	VALUES (N'465970b2-8bc3-435f-af97-8ca26f2bf383', N'telemetry-last-exectime', N'2020-01-01 12:08:02.380', 0, GETUTCDATE(), NULL, GETUTCDATE(), NULL)
END

IF NOT EXISTS(SELECT 1 FROM dbo.[configuration] WHERE [configKey] = 'db-version') 
	OR ((SELECT CONVERT(FLOAT,[value]) FROM dbo.[configuration] WHERE [configKey] = 'db-version') < 1 )
BEGIN

	INSERT [dbo].[KitType] ([guid], [companyGuid], [name], [code], [tag], [isActive], [isDeleted], [createdDate], [createdBy], [updatedDate], [updatedBy]) VALUES (N'e1b90a99-ee2b-4c77-8696-f6145c4bc23b', NULL, N'Default', N'Default', NULL, 1, 0, CAST(N'2020-02-12T13:20:44.217' AS DateTime), N'68aa338c-ebd7-4686-b350-de844c71db1f', NULL, NULL)
	
	INSERT [dbo].[KitTypeAttribute] ([guid], [parentTemplateAttributeGuid], [templateGuid], [localName], [code], [tag], [description]) VALUES (N'7088d02a-2054-47b2-b2a7-029d74febbe8', NULL, N'e1b90a99-ee2b-4c77-8696-f6145c4bc23b', N'dust', N'dust', NULL, N'dust')
	INSERT [dbo].[KitTypeAttribute] ([guid], [parentTemplateAttributeGuid], [templateGuid], [localName], [code], [tag], [description]) VALUES (N'a26595ed-ecd7-4461-8010-36ca55463181', NULL, N'e1b90a99-ee2b-4c77-8696-f6145c4bc23b', N'so2', N'so2', NULL, N'so2')
	INSERT [dbo].[KitTypeAttribute] ([guid], [parentTemplateAttributeGuid], [templateGuid], [localName], [code], [tag], [description]) VALUES (N'89f8720c-2106-4585-84ae-5f1adb1bf2e7', NULL, N'e1b90a99-ee2b-4c77-8696-f6145c4bc23b', N'temp', N'temp', NULL, N'temperature')
	INSERT [dbo].[KitTypeAttribute] ([guid], [parentTemplateAttributeGuid], [templateGuid], [localName], [code], [tag], [description]) VALUES (N'804860f7-e0b0-47cc-88f0-65557eb26bf6', NULL, N'e1b90a99-ee2b-4c77-8696-f6145c4bc23b', N'ch4', N'ch4', NULL, 'ch4')
	INSERT [dbo].[KitTypeAttribute] ([guid], [parentTemplateAttributeGuid], [templateGuid], [localName], [code], [tag], [description]) VALUES (N'2e03ba85-bdf8-4133-9c79-67eb5c07c1e2', NULL, N'e1b90a99-ee2b-4c77-8696-f6145c4bc23b', N'humidity', N'humidity', NULL, N'humidity')
	INSERT [dbo].[KitTypeAttribute] ([guid], [parentTemplateAttributeGuid], [templateGuid], [localName], [code], [tag], [description]) VALUES (N'3e8fe951-4b00-401d-86bf-c2043379fa70', NULL, N'e1b90a99-ee2b-4c77-8696-f6145c4bc23b', N'co2', N'co2', NULL,  N'co2')
	INSERT [dbo].[KitTypeAttribute] ([guid], [parentTemplateAttributeGuid], [templateGuid], [localName], [code], [tag], [description]) VALUES (N'8e598f2f-6a33-4f5a-8b04-c57b4b92f5d8', NULL, N'e1b90a99-ee2b-4c77-8696-f6145c4bc23b', N'lpg', N'lpg', NULL, N'lpg')
	INSERT [dbo].[KitTypeAttribute] ([guid], [parentTemplateAttributeGuid], [templateGuid], [localName], [code], [tag], [description]) VALUES (N'a3ea1394-d5a8-43d9-96a4-f084273b40d3', NULL, N'e1b90a99-ee2b-4c77-8696-f6145c4bc23b', N'co', N'co', NULL, N'co')
	
	INSERT INTO [dbo].[AdminUser] ([guid],[email],[companyGuid],[firstName],[lastName],[password],[isActive],[isDeleted],[createdDate]) VALUES (NEWID(),'admin@airquality.com','AB469212-2488-49AD-BC94-B3A3F45590D2','Air Quality','admin','Softweb#123',1,0,GETUTCDATE())
	
	UPDATE [dbo].[Configuration]
	SET [value]  = '1'
	WHERE [configKey] = 'db-version'

END
GO