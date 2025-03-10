import axios from "axios";
import { API_URL } from "../config";

export interface Equipment {
  id: number;
  name: string;
  description?: string;
  dailyRentalPrice: number;
  quantity: number;
  categoryId: number;
  category?: {
    id: number;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentCategory {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface EquipmentBundle {
  id: number;
  name: string;
  description?: string;
  dailyRentalPrice: number;
  discount: number;
  isActive: boolean;
  bundleItems: EquipmentBundleItem[];
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentBundleItem {
  id: number;
  bundleId: number;
  equipmentId: number;
  quantity: number;
  equipment?: Equipment;
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

export interface EquipmentFilter {
  categoryId?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "ASC" | "DESC";
}

export class EquipmentService {
  private getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async getAllEquipment(
    filter: EquipmentFilter = {}
  ): Promise<PaginatedResponse<Equipment>> {
    const params = new URLSearchParams();

    if (filter.page) params.append("page", filter.page.toString());
    if (filter.limit) params.append("limit", filter.limit.toString());
    if (filter.search) params.append("search", filter.search);
    if (filter.sort) params.append("sort", filter.sort);
    if (filter.order) params.append("order", filter.order);
    if (filter.categoryId)
      params.append("categoryId", filter.categoryId.toString());
    if (filter.minPrice) params.append("minPrice", filter.minPrice.toString());
    if (filter.maxPrice) params.append("maxPrice", filter.maxPrice.toString());
    if (filter.isActive !== undefined)
      params.append("isActive", filter.isActive.toString());

    const response = await axios.get<PaginatedResponse<Equipment>>(
      `${API_URL}/equipment?${params.toString()}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async getEquipmentById(id: number): Promise<SingleResponse<Equipment>> {
    const response = await axios.get<SingleResponse<Equipment>>(
      `${API_URL}/equipment/${id}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async getEquipmentByCategory(
    categoryId: number,
    filter: EquipmentFilter = {}
  ): Promise<PaginatedResponse<Equipment>> {
    const params = new URLSearchParams();

    if (filter.page) params.append("page", filter.page.toString());
    if (filter.limit) params.append("limit", filter.limit.toString());
    if (filter.search) params.append("search", filter.search);
    if (filter.sort) params.append("sort", filter.sort);
    if (filter.order) params.append("order", filter.order);

    const response = await axios.get<PaginatedResponse<Equipment>>(
      `${API_URL}/equipment/category/${categoryId}?${params.toString()}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async createEquipment(
    equipment: Omit<Equipment, "id" | "createdAt" | "updatedAt">
  ): Promise<SingleResponse<Equipment>> {
    const response = await axios.post<SingleResponse<Equipment>>(
      `${API_URL}/equipment`,
      equipment,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async updateEquipment(
    id: number,
    equipment: Partial<Omit<Equipment, "id" | "createdAt" | "updatedAt">>
  ): Promise<SingleResponse<Equipment>> {
    const response = await axios.put<SingleResponse<Equipment>>(
      `${API_URL}/equipment/${id}`,
      equipment,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async deleteEquipment(id: number): Promise<SingleResponse<null>> {
    const response = await axios.delete<SingleResponse<null>>(
      `${API_URL}/equipment/${id}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  // Category methods
  async getAllCategories(
    params: { page?: number; limit?: number; search?: string } = {}
  ): Promise<PaginatedResponse<EquipmentCategory>> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);

    const response = await axios.get<PaginatedResponse<EquipmentCategory>>(
      `${API_URL}/equipment/categories?${queryParams.toString()}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async getCategoryById(
    id: number
  ): Promise<SingleResponse<EquipmentCategory>> {
    const response = await axios.get<SingleResponse<EquipmentCategory>>(
      `${API_URL}/equipment/categories/${id}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async createCategory(
    category: Omit<EquipmentCategory, "id" | "createdAt" | "updatedAt">
  ): Promise<SingleResponse<EquipmentCategory>> {
    const response = await axios.post<SingleResponse<EquipmentCategory>>(
      `${API_URL}/equipment/categories`,
      category,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async updateCategory(
    id: number,
    category: Partial<Omit<EquipmentCategory, "id" | "createdAt" | "updatedAt">>
  ): Promise<SingleResponse<EquipmentCategory>> {
    const response = await axios.put<SingleResponse<EquipmentCategory>>(
      `${API_URL}/equipment/categories/${id}`,
      category,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async deleteCategory(id: number): Promise<SingleResponse<null>> {
    const response = await axios.delete<SingleResponse<null>>(
      `${API_URL}/equipment/categories/${id}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  // Bundle methods
  async getAllBundles(
    params: { page?: number; limit?: number; search?: string } = {}
  ): Promise<PaginatedResponse<EquipmentBundle>> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);

    const response = await axios.get<PaginatedResponse<EquipmentBundle>>(
      `${API_URL}/bundles?${queryParams.toString()}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async getBundleById(id: number): Promise<SingleResponse<EquipmentBundle>> {
    const response = await axios.get<SingleResponse<EquipmentBundle>>(
      `${API_URL}/bundles/${id}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async createBundle(
    bundle: Omit<EquipmentBundle, "id" | "createdAt" | "updatedAt">
  ): Promise<SingleResponse<EquipmentBundle>> {
    const response = await axios.post<SingleResponse<EquipmentBundle>>(
      `${API_URL}/bundles`,
      bundle,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async updateBundle(
    id: number,
    bundle: Partial<Omit<EquipmentBundle, "id" | "createdAt" | "updatedAt">>
  ): Promise<SingleResponse<EquipmentBundle>> {
    const response = await axios.put<SingleResponse<EquipmentBundle>>(
      `${API_URL}/bundles/${id}`,
      bundle,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async deleteBundle(id: number): Promise<SingleResponse<null>> {
    const response = await axios.delete<SingleResponse<null>>(
      `${API_URL}/bundles/${id}`,
      this.getAuthHeaders()
    );
    return response.data;
  }
}
