const { Document } = require("../models/document");
const { AccessList } = require("../models/accessList");
const { sequelize } = require("../configs/dbConfig");
const { Op } = require("sequelize");

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

module.exports = {
    createDocument, getDocumentsList, getDocument
}