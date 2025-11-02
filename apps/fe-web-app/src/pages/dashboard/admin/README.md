# Admin Dashboard Pages

## 📁 Cấu trúc thư mục

```
admin/
├── AdminDashboard.tsx       # Trang dashboard chính cho Admin
├── AdminBrandManagement.tsx # Quản lý thương hiệu (CRUD)
├── components/              # Components dùng RIÊNG cho Admin
│   ├── BrandFormDialog.tsx
│   ├── DeleteBrandDialog.tsx
│   ├── AdminStatCards.tsx
│   ├── RevenueAreaChart.tsx
│   ├── TableLayout.tsx
│   ├── FormDialog.tsx
│   └── index.ts
├── index.ts                 # Export file
└── README.md               # File này
```

⚠️ **LƯU Ý**: Tất cả components trong `admin/components/` chỉ dành riêng cho Admin. Staff KHÔNG dùng chung components này!

## 🎯 Vai trò (Role)

Trang này dành riêng cho **Admin** - quyền quản trị cao nhất trong hệ thống.

## ✨ Tính năng

### 1. AdminDashboard

- **Overview**: Tổng quan hệ thống
  - Thống kê tổng số xe, booking, rental
  - Biểu đồ doanh thu
  - Danh sách activity gần đây
- **Quản lý Users**: Tạo/xóa tài khoản admin, staff, renter
- **Quản lý Stations**: CRUD stations
- **Quản lý Vehicles**: CRUD xe điện
- **Quản lý Bookings**: Xem/tạo/cập nhật/xóa bookings
- **Quản lý Rentals**: CRUD rental records
- **Quản lý Payments**: Xem/tạo payment records
- **Quản lý Documents**: Xem hồ sơ user documents
- **Quản lý Brands**: Link đến AdminBrandManagement

### 2. AdminBrandManagement

- **Danh sách Brands**: Table view với search & filter
- **Tạo Brand**: Form wizard 3 bước (thông tin cơ bản, specs, manufacturer)
- **Sửa Brand**: Form pre-filled với data hiện tại
- **Xóa Brand**: Confirm dialog trước khi xóa
- **Upload Image**: Hỗ trợ upload ảnh thương hiệu

## 🔐 Permissions

Chỉ users với role = `admin` mới truy cập được:

```tsx
const isAdmin = effectiveRole === 'admin';

if (!isAdmin) {
  return <AccessDenied />;
}
```

## 📦 Import

```tsx
// Import tất cả admin pages
import { AdminDashboard, AdminBrandManagement } from '@/pages/dashboard/admin';

// Hoặc import riêng lẻ
import { AdminDashboard } from '@/pages/dashboard/admin';
import { AdminBrandManagement } from '@/pages/dashboard/admin';
```

## 🚀 Sử dụng

### Trong route:

```tsx
import { AdminDashboard } from '@/pages/dashboard/admin';

const routes = [
  {
    path: '/admin',
    element: <AdminDashboard />,
    // Guard với role check
    loader: requireAdmin,
  },
];
```

### Trong component:

```tsx
import { useAuthContext } from '@/contexts/auth-context';
import { AdminDashboard } from '@/pages/dashboard/admin';

const App = () => {
  const { role } = useAuthContext();

  if (role === 'admin') {
    return <AdminDashboard />;
  }

  return <Redirect to="/unauthorized" />;
};
```

## 🛠️ Components được sử dụng

### Shared Components (từ `/shared`)

- `BrandFormDialog` - Form tạo/sửa brand (wizard 3 steps)
- `DeleteBrandDialog` - Confirm dialog xóa brand
- `AdminStatCards` - Stat cards cho dashboard
- `RevenueAreaChart` - Biểu đồ doanh thu
- `TableLayout` - Table layout reusable

### shadcn/ui Components

- `Button`, `Card`, `Input`, `Label`
- `Table`, `Dialog`, `Select`
- `Badge`, `Tabs`

## 📊 Data Flow

```
AdminDashboard
  ↓
useXxxHook (TanStack Query)
  ↓
XxxApi (Axios)
  ↓
Backend API (/api/...)
  ↓
MongoDB
```

## 🔄 State Management

- **React Query**: Data fetching, caching, mutations
- **React Hook Form**: Form state management
- **Local State**: UI states (dialogs, tabs, filters)

```tsx
const { useBrandList, createBrand, updateBrand, deleteBrand } = useBrandHook();
const { data, isLoading } = useBrandList();

const handleSubmit = async (values) => {
  await createBrand.mutateAsync(values);
  // Auto refetch do React Query invalidation
};
```

## 🎨 UI/UX

### Gradient Theme

```tsx
className = 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50';
className = 'bg-gradient-to-r from-blue-600 to-indigo-600';
```

### Icons (lucide-react)

```tsx
import { Plus, Pencil, Trash2, Search, Filter } from 'lucide-react';
```

### Responsive

- Desktop: Grid layout 2-3 columns
- Tablet: Grid 2 columns
- Mobile: Single column

## 🧪 Testing

### Unit Tests

```bash
npm test -- AdminDashboard.test.tsx
npm test -- AdminBrandManagement.test.tsx
```

### E2E Tests (Cypress)

```bash
npm run e2e:admin-dashboard
```

## 📝 Best Practices

1. **Role-based Access**

   ```tsx
   if (!isAdmin) return <AccessDenied />;
   ```

2. **Error Handling**

   ```tsx
   try {
     await mutation.mutateAsync(data);
     toast.success('Success!');
   } catch (error) {
     toast.error('Error!');
   }
   ```

3. **Loading States**

   ```tsx
   {
     isLoading ? <Skeleton /> : <Content />;
   }
   ```

4. **Mutations**
   ```tsx
   <Button disabled={mutation.isPending}>{mutation.isPending ? 'Loading...' : 'Submit'}</Button>
   ```

## 🔗 Related

- **Staff Pages**: `/staff` - Chức năng dành cho staff
- **Shared Components**: `/shared` - Components dùng chung
- **Hooks**: `/hooks/use-*.tsx` - Custom hooks

## 🐛 Known Issues

- AdminDashboard quá lớn (2200+ lines) - cần tách nhỏ thành modules
- Một số sections chưa có pagination
- Search & filter chưa debounce

## 🚧 TODO

- [ ] Tách AdminDashboard thành sub-components
- [ ] Thêm pagination cho tables
- [ ] Debounce search input
- [ ] Export data (CSV/Excel)
- [ ] Bulk actions
- [ ] Advanced filters
- [ ] Real-time notifications

---

**Last Updated**: November 2, 2025  
**Maintainer**: Admin Team
