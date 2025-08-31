import { AuthResponse, LoginRequest, RegisterRequest, ApiError } from '@/types/auth';
import { 
  InventoryItem, 
  InventoryRequest, 
  Service, 
  ServiceRequest, 
  UserResponse, 
  UpdateRoleRequest, 
  UserStats 
} from '@/types/admin';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshTokenValue: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Initialize tokens from localStorage if available
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshTokenValue = localStorage.getItem('refreshToken');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    if (this.accessToken && !endpoint.includes('/auth/')) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.accessToken}`,
      };
    }

    try {
      console.log(`🔍 API Request: ${config.method || 'GET'} ${url}`, {
        headers: config.headers,
        body: config.body ? (typeof config.body === 'string' ? JSON.parse(config.body) : config.body) : undefined,
      });
      
      const response = await fetch(url, config);
      
      console.log(`📡 API Response: ${response.status} ${response.statusText}`, {
        url,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      });
      
      // Handle 401 errors by attempting token refresh
      if (response.status === 401 && this.refreshTokenValue && !endpoint.includes('/auth/refresh')) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry the original request with new token
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${this.accessToken}`,
          };
          const retryResponse = await fetch(url, config);
          if (!retryResponse.ok) {
            throw await this.handleError(retryResponse);
          }
          return retryResponse.json();
        } else {
          // Refresh failed, redirect to login
          this.clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw new Error('Session expired');
        }
      }

      if (!response.ok) {
        const errorResponse = await this.handleError(response);
        console.error(`❌ API Error ${response.status}:`, errorResponse);
        throw errorResponse;
      }

      const responseData = await response.json();
      console.log(`✅ API Success:`, responseData);
      return responseData;
    } catch (error) {
      console.error('💥 API Error:', error);
      throw error;
    }
  }

  private async handleError(response: Response): Promise<ApiError> {
    try {
      const errorData = await response.json();
      return errorData;
    } catch {
      return { error: `HTTP ${response.status}: ${response.statusText}` };
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshTokenValue) return false;

    console.log('DEBUG: Attempting token refresh');
    console.log('DEBUG: Access token:', this.accessToken?.substring(0, 50) + '...');
    console.log('DEBUG: Refresh token:', this.refreshTokenValue?.substring(0, 50) + '...');
    console.log('DEBUG: Tokens are same?', this.accessToken === this.refreshTokenValue);

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.refreshTokenValue}`,
        },
      });

      console.log('DEBUG: Refresh response status:', response.status);
      
      if (response.ok) {
        const data: AuthResponse = await response.json();
        console.log('DEBUG: Got new tokens, access:', data.accessToken?.substring(0, 50) + '...');
        console.log('DEBUG: Got new tokens, refresh:', data.refreshToken?.substring(0, 50) + '...');
        this.setTokens(data.accessToken, data.refreshToken);
        return true;
      } else {
        const errorData = await response.json();
        console.error('Token refresh failed:', errorData);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  }

  setTokens(accessToken: string, refreshToken: string) {
    console.log('DEBUG: Setting tokens');
    console.log('DEBUG: Setting access token:', accessToken?.substring(0, 50) + '...');
    console.log('DEBUG: Setting refresh token:', refreshToken?.substring(0, 50) + '...');
    console.log('DEBUG: Tokens are same?', accessToken === refreshToken);
    
    this.accessToken = accessToken;
    this.refreshTokenValue = refreshToken;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshTokenValue = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  // Auth endpoints
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.accessToken) {
      this.setTokens(response.accessToken, response.refreshToken);
    }
    
    return response;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.accessToken) {
      this.setTokens(response.accessToken, response.refreshToken);
    }
    
    return response;
  }

  async refreshToken(): Promise<AuthResponse> {
    if (!this.refreshTokenValue) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.refreshTokenValue}`,
        },
      });

      if (!response.ok) {
        throw await this.handleError(response);
      }

      const data: AuthResponse = await response.json();
      
      if (data.accessToken) {
        this.setTokens(data.accessToken, data.refreshToken);
      }
      
      return data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  logout() {
    this.clearTokens();
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Admin - Inventory Management
  async getInventory(): Promise<InventoryItem[]> {
    return this.request<InventoryItem[]>('/inventory');
  }

  async getInventoryItem(id: number): Promise<InventoryItem> {
    return this.request<InventoryItem>(`/inventory/${id}`);
  }

  async createInventoryItem(data: InventoryRequest): Promise<InventoryItem> {
    return this.request<InventoryItem>('/inventory', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInventoryItem(id: number, data: InventoryRequest): Promise<InventoryItem> {
    return this.request<InventoryItem>(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteInventoryItem(id: number): Promise<void> {
    await this.request<void>(`/inventory/${id}`, {
      method: 'DELETE',
    });
  }

  async updateStock(id: number, quantity: number): Promise<InventoryItem> {
    return this.request<InventoryItem>(`/inventory/${id}/stock`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async searchInventory(searchTerm: string): Promise<InventoryItem[]> {
    return this.request<InventoryItem[]>(`/inventory?search=${encodeURIComponent(searchTerm)}`);
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    return this.request<InventoryItem[]>('/inventory?lowStock=true');
  }

  // Admin - Service Management
  async getServices(): Promise<Service[]> {
    return this.request<Service[]>('/services');
  }

  async getService(id: number): Promise<Service> {
    return this.request<Service>(`/services/${id}`);
  }

  async createService(data: ServiceRequest): Promise<Service> {
    return this.request<Service>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateService(id: number, data: ServiceRequest): Promise<Service> {
    return this.request<Service>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteService(id: number): Promise<void> {
    await this.request<void>(`/services/${id}`, {
      method: 'DELETE',
    });
  }

  async getServiceCategories(): Promise<string[]> {
    return this.request<string[]>('/services/categories');
  }

  async searchServices(searchTerm: string): Promise<Service[]> {
    return this.request<Service[]>(`/services?search=${encodeURIComponent(searchTerm)}`);
  }

  // Admin - User Management
  async getUsers(): Promise<UserResponse[]> {
    return this.request<UserResponse[]>('/users');
  }

  async getUser(id: number): Promise<UserResponse> {
    return this.request<UserResponse>(`/users/${id}`);
  }

  async updateUserRole(id: number, data: UpdateRoleRequest): Promise<UserResponse> {
    return this.request<UserResponse>(`/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: number): Promise<void> {
    await this.request<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getUserStats(): Promise<UserStats> {
    return this.request<UserStats>('/users/stats');
  }

  async searchUsers(searchTerm: string): Promise<UserResponse[]> {
    return this.request<UserResponse[]>(`/users?search=${encodeURIComponent(searchTerm)}`);
  }

  // Customer - Parts browsing
  async getParts(): Promise<InventoryItem[]> {
    return this.request<InventoryItem[]>('/parts');
  }

  async getPart(id: number): Promise<InventoryItem> {
    return this.request<InventoryItem>(`/parts/${id}`);
  }

  // Customer - Profile Management
  async getUserProfile(): Promise<any> {
    return this.request<any>('/me');
  }

  async addVehicle(data: any): Promise<any> {
    return this.request<any>('/me/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Customer - Shopping Cart
  async getCart(): Promise<any> {
    return this.request<any>('/cart');
  }

  async addToCart(data: any): Promise<any> {
    return this.request<any>('/cart/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async removeFromCart(itemId: number): Promise<any> {
    return this.request<any>(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  async updateCartItemQuantity(itemId: number, quantity: number): Promise<any> {
    return this.request<any>(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  // Customer - Orders
  async createOrder(): Promise<any> {
    return this.request<any>('/orders', {
      method: 'POST',
    });
  }

  async uploadReceipt(orderId: number, data: any): Promise<any> {
    return this.request<any>(`/orders/${orderId}/receipt`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Debug endpoints
  async debugUserInfo(): Promise<any> {
    return this.request<any>('/debug/user-info');
  }

  async debugInventoryInfo(id: number): Promise<any> {
    return this.request<any>(`/debug/inventory/${id}`);
  }

  async debugInventoryCount(): Promise<any> {
    return this.request<any>('/debug/inventory/count');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;