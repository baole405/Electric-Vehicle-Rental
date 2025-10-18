import { apiRequest } from '@/lib/http';
import type { BaseResponse } from '@/schema/common/response.type';
import type {
  TCreateUserDocument,
  TUserDocument,
} from '@/schema/user-document.schema';
import { API_SUFFIX } from './util.api';

const getAllDocuments = async () =>
  await apiRequest.get<BaseResponse<TUserDocument[]>>(
    API_SUFFIX.USER_DOCUMENT_API
  );

const getDocumentsByUser = async (userId: string) =>
  await apiRequest.get<BaseResponse<TUserDocument[]>>(
    API_SUFFIX.USER_DOCUMENT_API,
    {
      params: { userId },
    }
  );

const submitDocuments = async (payload: TCreateUserDocument) => {
  const formData = new FormData();
  formData.append('user', payload.user);
  formData.append('documentType', payload.documentType);
  formData.append('identityNumber', payload.identityNumber);
  formData.append('drivingLicenseNumber', payload.drivingLicenseNumber);
  formData.append('frontImage', payload.frontImage);
  formData.append('backImage', payload.backImage);
  formData.append('drivingLicenseImage', payload.drivingLicenseImage);

  return await apiRequest.post<BaseResponse<TUserDocument>>(
    API_SUFFIX.USER_DOCUMENT_API,
    formData
  );
};

const updateDocument = async (id: string, payload: Partial<TUserDocument>) =>
  await apiRequest.put<BaseResponse<TUserDocument>>(
    API_SUFFIX.USER_DOCUMENT_API + `/${id}`,
    payload
  );

const deleteDocument = async (id: string) =>
  await apiRequest.delete(API_SUFFIX.USER_DOCUMENT_API + `/${id}`);

export const UserDocumentApi = {
  getAllDocuments,
  getDocumentsByUser,
  submitDocuments,
  updateDocument,
  deleteDocument,
};
