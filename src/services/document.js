const { Document } = require("../models/document");
const { AccessList } = require("../models/accessList");
const { sequelize } = require("../configs/dbConfig");
const { Op } = require("sequelize");
const { User } = require("../models/user");

const createDocument = async ({ title, file, description, user }) => {
    try{
        const transaction = await sequelize.transaction();
        const newDocument = await Document.create({
                title: title || file.originalname,
                description: description,
                url: file.location,
            },
            { transaction }
        )

        await AccessList.create({
                userId: user.id,
                documentId: newDocument.id,
                accessType: 'owner',
            },
            { transaction }
        )

        await transaction.commit();

        return { newDocument, error: null };
    } catch (error) {
        return { error: error.message, newDocument: null };
    }
}

const getDocumentsList = async ({ user, page, accessType }) => {
    try{
        const accessLists = await user.getAccessLists();
        const documentIdVsAccessType = {};
        accessLists.map((al) => {
            if (accessType && accessType === al.accessType) {
                documentIdVsAccessType[al.documentId] = accessType
            }
            if (!accessType) {
                documentIdVsAccessType[al.documentId] = al.accessType
            }
        });
        const documents = await Document.findAll({
            where: {
                id: {
                    [Op.in]: Object.keys(documentIdVsAccessType)
                }
            },
            limit: 10,
            offset: (page - 1) * 10,
        })

        const documentsData = documents.map((d) => {
            return {
                ...d.dataValues,
                accessType: documentIdVsAccessType[d.id],
            }
        })
        
        return { documents: documentsData, error: null };
    } catch (error) {
        return { error: error.message, documents: null };
    }
}

const getDocument = async ({ id, user }) => {
    try{
        const document = await Document.findOne({
            where: {
                id,
                status: "active"
            }
        })
        if (!document) {
            return { error: 'Document not found', document: null, errorCode: 400 };
        }

        const accessList = await AccessList.findOne({
            where: {
                documentId: document.id,
                userId: user.id,
                status: "active"
            }
        })
        if (!accessList) {
            return { error: 'Do not have access to this document', document: null, errorCode: 400 };
        }
        return { document, error: null };
    } catch (error) {
        return { error: error.message, document: null, errorCode: 500 };
    }
}

const validateShareParams = async ({ documentIds, userEmails, accessType, user }) => {
    if (!documentIds || !userEmails || !accessType) {
        return { error: 'Missing required parameters', valid: false };
    }

    if (!['edit', 'read'].includes(accessType)) {
        return { error: 'Invalid access type', valid: false };
    }

    const document = await Document.findAll({
        where: {
            id: {
                [Op.in]: documentIds,
            },
            status: "active",
        }
    })
    if (document.length !== documentIds.length) {
        return { error: 'Invalid document ids', valid: false };
    }

    const users = await User.findAll({
        where: {
            email: {
                [Op.in]: userEmails,
            },
            status: "active"
        }
    })
    if (users.length !== userEmails.length) {
        return { error: 'Invalid user emails', valid: false };
    }

    const userAccessLists = await user.getAccessLists({
        where: {
            documentId: {
                [Op.in]: documentIds,
            },
            status: "active",
            accessType: "owner"
        }
    })
    if (userAccessLists.length !== documentIds.length) {
        return { error: 'You do not have access to the documents', valid: false };
    }

    return { valid: true };
}

const shareDocuments = async ({ documentIds, userEmails, accessType }) => {
    try {
        const users = await User.findAll({
            where: {
                email: {
                    [Op.in]: userEmails,
                },
                status: "active"
            },
        })
        const userIds = users.map((user) => user.id)

        const existingAccessList = await AccessList.findAll({
            where: {
                documentId: {
                    [Op.in]: documentIds,
                },
                userId: {
                    [Op.in]: userIds.map((user) => user.id),
                },
                status: "active",
            }
        })

        const transaction = await sequelize.transaction();
        if (existingAccessList) {
            await AccessList.update(
                {
                    status: "inactive",
                },
                {
                    where: {
                        documentId: {
                            [Op.in]: documentIds,
                        },
                        userId: {
                            [Op.in]: userIds,
                        },
                        status: "active",
                    }
                },
                {
                    transaction
                }
            )
        }
        
        const newAccessData = userIds.flatMap((id) => (
            documentIds.map((documentId) => ({
            documentId: documentId,
            userId: id,
            accessType,
            status: "active"
        }))
        ))

        await AccessList.bulkCreate(newAccessData, {
            transaction
        })

        await transaction.commit();

        return { error: null }
    } catch (error) {
        return { error: error.message };   
    }
}

module.exports = {
    createDocument, getDocumentsList, getDocument, validateShareParams, shareDocuments
}