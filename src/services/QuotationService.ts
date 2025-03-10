import axios from "axios";
import { API_URL } from "../config";

export enum QuotationStatus {
  DRAFT = "draft",
  SENT = "sent",
  APPROVED = "approved",
  REJECTED = "rejected",
  CONVERTED_TO_DO = "converted_to_do",
  CONVERTED_TO_INVOICE = "converted_to_invoice",
}

export enum ItemType {
  RENTAL = "rental",
  SERVICE = "service",
  SALE = "sale",
}

export interface QuotationItem {
  id?: number;
  quotationId: number;
  sectionId?: number;
  groupId?: number;
  equipmentId?: number;
  equipment?: {
    id: number;
    name: string;
    dailyRentalPrice: number;
  };
  itemName: string;
  description?: string;
  quantity: number;
  unit?: string;
  pricePerDay: number;
  days: number;
  total?: number;
  remarks?: string;
  type?: ItemType;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuotationItemGroup {
  id?: number;
  name: string;
  sectionId: number;
  description?: string;
  items?: QuotationItem[];
  total?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuotationSection {
  id?: number;
  name: string;
  date: string;
  quotationId: number;
  description?: string;
  groups?: QuotationItemGroup[];
  subtotal?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Quotation {
  id?: number;
  quotationNumber: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  projectName?: string;
  projectDescription?: string;
  issueDate: string;
  validUntil?: string;
  subtotal?: number;
  tax?: number;
  discount?: number;
  total?: number;
  status?: QuotationStatus;
  notes?: string;
  terms?: string;
  sections?: QuotationSection[];
  items?: QuotationItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  status: boolean;
  message: string;
  data: T[];
  meta: PaginationMeta;
}

export interface SingleResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export interface ErrorResponse {
  status: boolean;
  message: string;
  errorCode: number;
  errors?: { field: string; message: string }[];
}

export interface QuotationFilter {
  status?: QuotationStatus;
  search?: string;
  clientName?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "ASC" | "DESC";
}

export class QuotationService {
  private getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async getAllQuotations(
    filter: QuotationFilter = {}
  ): Promise<PaginatedResponse<Quotation>> {
    const queryParams = new URLSearchParams();

    if (filter.page) queryParams.append("page", filter.page.toString());
    if (filter.limit) queryParams.append("limit", filter.limit.toString());
    if (filter.search) queryParams.append("search", filter.search);
    if (filter.status) queryParams.append("status", filter.status);
    if (filter.clientName) queryParams.append("clientName", filter.clientName);
    if (filter.startDate) queryParams.append("startDate", filter.startDate);
    if (filter.endDate) queryParams.append("endDate", filter.endDate);
    if (filter.sort) queryParams.append("sort", filter.sort);
    if (filter.order) queryParams.append("order", filter.order);

    const response = await axios.get<PaginatedResponse<Quotation>>(
      `${API_URL}/quotations?${queryParams.toString()}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async getQuotationById(id: number): Promise<SingleResponse<Quotation>> {
    const response = await axios.get<SingleResponse<Quotation>>(
      `${API_URL}/quotations/${id}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async createQuotation(
    quotation: Omit<Quotation, "id" | "createdAt" | "updatedAt">
  ): Promise<SingleResponse<Quotation>> {
    const response = await axios.post<SingleResponse<Quotation>>(
      `${API_URL}/quotations`,
      quotation,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async updateQuotation(
    id: number,
    quotation: Partial<Omit<Quotation, "id" | "createdAt" | "updatedAt">>
  ): Promise<SingleResponse<Quotation>> {
    const response = await axios.put<SingleResponse<Quotation>>(
      `${API_URL}/quotations/${id}`,
      quotation,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async updateQuotationStatus(
    id: number,
    status: QuotationStatus
  ): Promise<SingleResponse<Quotation>> {
    const response = await axios.put<SingleResponse<Quotation>>(
      `${API_URL}/quotations/${id}/status`,
      { status },
      this.getAuthHeaders()
    );
    return response.data;
  }

  async deleteQuotation(id: number): Promise<SingleResponse<null>> {
    const response = await axios.delete<SingleResponse<null>>(
      `${API_URL}/quotations/${id}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async addQuotationItem(
    quotationId: number,
    item: Omit<QuotationItem, "id" | "quotationId" | "createdAt" | "updatedAt">
  ): Promise<SingleResponse<QuotationItem>> {
    const response = await axios.post<SingleResponse<QuotationItem>>(
      `${API_URL}/quotations/${quotationId}/items`,
      item,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async removeQuotationItem(
    quotationId: number,
    itemId: number
  ): Promise<SingleResponse<null>> {
    const response = await axios.delete<SingleResponse<null>>(
      `${API_URL}/quotations/${quotationId}/items/${itemId}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async addQuotationSection(
    quotationId: number,
    section: Omit<
      QuotationSection,
      "id" | "quotationId" | "createdAt" | "updatedAt"
    >
  ): Promise<SingleResponse<QuotationSection>> {
    const response = await axios.post<SingleResponse<QuotationSection>>(
      `${API_URL}/quotations/${quotationId}/sections`,
      section,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async removeQuotationSection(
    quotationId: number,
    sectionId: number
  ): Promise<SingleResponse<null>> {
    const response = await axios.delete<SingleResponse<null>>(
      `${API_URL}/quotations/${quotationId}/sections/${sectionId}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async exportQuotationToPdf(quotationId: number): Promise<Blob> {
    const response = await axios.get(
      `${API_URL}/quotations/${quotationId}/export/pdf`,
      {
        ...this.getAuthHeaders(),
        responseType: "blob",
      }
    );
    return response.data;
  }

  async exportQuotationToExcel(quotationId: number): Promise<Blob> {
    const response = await axios.get(
      `${API_URL}/quotations/${quotationId}/export/excel`,
      {
        ...this.getAuthHeaders(),
        responseType: "blob",
      }
    );
    return response.data;
  }
}
