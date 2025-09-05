# Mechanic Parts Request System - Implementation Plan

*Created: September 2, 2025*

## Problem Identification

**Current System Status:**

- ✅ Customer parts check-in system (mechanic can verify and use customer's parts)
- ✅ Inventory management (admin can manage workshop parts)
- ✅ Service booking system

**Missing Functionality:**

- ❌ **Mechanic parts request system** - mechanics can't request additional workshop parts during service
- ❌ **Workshop inventory integration** with service workflow
- ❌ **Dynamic parts procurement** during active service jobs

**User Observation:**

> "What I'm currently seeing in the UI right now is a mechanic can adjust quantity brought, condition, notes and finally check in. There's no requesting part yet."

## Business Scenario

**Typical Mechanic Workflow:**

1. Customer books service + brings parts A, B
2. Mechanic starts service, checks in customer parts A, B *NO CHECK IN*
3. **During service**: Mechanic discovers need for additional parts C, D, E
4. **Current gap**: No way to request parts C, D, E from workshop inventory
5. **Needed**: Mechanic parts request system with admin approval workflow

## Solution: Integrated Mechanic Parts Request System

### Phase 1: Core Entities

#### MechanicPartsRequest Entity

```java
@Entity
@Table(name = "mechanic_parts_requests")
public class MechanicPartsRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne
    @JoinColumn(name = "inventory_item_id", nullable = false)
    private Inventory inventoryItem;

    @ManyToOne
    @JoinColumn(name = "requested_by_mechanic_id", nullable = false)
    private User requestedBy; // MECHANIC role

    private Integer quantityRequested;
    private Integer quantityApproved = 0;
    private Integer quantityUsed = 0;

    @Enumerated(EnumType.STRING)
    private RequestStatus status = RequestStatus.PENDING;

    @Enumerated(EnumType.STRING)
    private RequestPriority priority = RequestPriority.NORMAL;

    @Column(length = 1000)
    private String reason; // Why this part is needed

    @ManyToOne
    @JoinColumn(name = "approved_by_admin_id")
    private User approvedBy; // ADMIN role

    @CreationTimestamp
    private LocalDateTime requestedAt;

    private LocalDateTime approvedAt;
    private LocalDateTime usedAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

enum RequestStatus {
    PENDING,        // Waiting for admin approval
    APPROVED,       // Admin approved, parts allocated
    REJECTED,       // Admin rejected request
    PARTIALLY_APPROVED, // Some quantity approved
    USED,           // Parts have been used in service
    CANCELLED       // Request cancelled by mechanic
}

enum RequestPriority {
    LOW,            // Can wait
    NORMAL,         // Standard request
    HIGH,           // Urgent for service completion
    CRITICAL        // Service blocked without this part
}
```

### Phase 2: Enhanced Mechanic Dashboard UI

**Current Mechanic Dashboard:**

```
[Booking Details]
[Customer Parts Check-In Section]
  - Check in customer parts ✅
  - Update quantities used ✅
```

**Enhanced Mechanic Dashboard:**

```
[Booking Details]

[Customer Parts Section]
  - Check in customer parts ✅
  - Update quantities used ✅

[Workshop Parts Request Section] 🆕
  - Search workshop inventory
  - Request additional parts
  - View request status (pending/approved/rejected)
  - Use approved parts
  - Update parts usage

[Service Progress Section] 🆕
  - Mark service milestones
  - Update service status
  - Complete service with final parts summary
```

### Phase 3: Parts Request Workflow

```
1. Mechanic discovers need for additional parts
   ↓
2. Mechanic searches workshop inventory
   ↓
3. Mechanic creates parts request with:
   - Part selection from inventory
   - Quantity needed
   - Priority level (LOW/NORMAL/HIGH/CRITICAL)
   - Reason/justification
   ↓
4. System validates request and sends notification to admin
   ↓
5. Admin receives notification and reviews request:
   - Check inventory availability
   - Review booking context and service requirements
   - Approve/reject/partial approve with quantities
   - Allocate parts to booking (deduct from available stock)
   ↓
6. Mechanic receives notification of decision
   ↓
7. If approved: Mechanic can use allocated parts
   ↓
8. System tracks parts usage and updates inventory
   ↓
9. Final billing calculation includes workshop parts costs
```

### Phase 4: Admin Parts Request Management Interface

**New Admin Dashboard Section:**

```
[Parts Requests Management]
  - Pending requests queue (priority sorted)
  - Request details with booking context
  - Inventory availability checker
  - Approve/reject interface with quantities
  - Bulk operations for multiple requests
  - Request history and analytics

[Enhanced Inventory Management]
  - Real-time inventory levels
  - Parts allocation tracking (reserved for approved requests)
  - Auto-deduction after parts usage
  - Low stock alerts and reorder suggestions
  - Parts usage analytics by service type
```

### Phase 5: Smart Request Logic & Intelligence

```java
@Service
public class SmartPartsRequestService {

    public PartsRequestRecommendation analyzeRequest(MechanicPartsRequest request) {
        Booking booking = request.getBooking();
        Inventory requestedItem = request.getInventoryItem();
        User customer = booking.getUser();

        // 1. Check if customer has this part available
        boolean customerHasPart = customerPartsInventoryService
            .hasAvailableParts(customer.getId(), requestedItem.getId());

        // 2. Check workshop inventory availability
        int workshopStock = inventoryService
            .getAvailableStock(requestedItem.getId());

        // 3. Analyze service history for common parts patterns
        List<Inventory> commonParts = serviceHistoryService
            .getCommonPartsForService(booking.getService().getId());

        // 4. Check for compatible alternatives
        List<Inventory> alternatives = inventoryService
            .getCompatibleAlternatives(requestedItem.getId());

        // 5. Calculate cost impact
        BigDecimal estimatedCost = calculatePartsCost(requestedItem, request.getQuantityRequested());

        return new PartsRequestRecommendation(
            customerHasPart,
            workshopStock,
            commonParts,
            alternatives,
            estimatedCost,
            generateSmartSuggestions(request)
        );
    }

    public void processSmartRequest(MechanicPartsRequest request) {
        PartsRequestRecommendation recommendation = analyzeRequest(request);

        if (recommendation.isCustomerHasPart()) {
            // Alert mechanic: customer has this part available
            notificationService.notifyMechanicAboutCustomerParts(request);
        } else if (recommendation.getWorkshopStock() >= request.getQuantityRequested()) {
            // Check if auto-approval criteria are met
            if (isAutoApprovable(request, recommendation)) {
                autoApproveRequest(request);
            } else {
                // Queue for admin review with recommendations
                queueForAdminReview(request, recommendation);
            }
        } else {
            // Insufficient stock - suggest alternatives or partial approval
            handleInsufficientStock(request, recommendation);
        }
    }

    private boolean isAutoApprovable(MechanicPartsRequest request, PartsRequestRecommendation recommendation) {
        return isTrustedMechanic(request.getRequestedBy()) &&
               request.getPriority() != RequestPriority.CRITICAL &&
               recommendation.getEstimatedCost().compareTo(AUTO_APPROVAL_LIMIT) <= 0 &&
               recommendation.getWorkshopStock() >= request.getQuantityRequested();
    }
}
```

### Phase 6: API Endpoints

#### Mechanic Endpoints

```java
@RestController
@RequestMapping("/api/bookings/{bookingId}/parts-requests")
@PreAuthorize("hasRole('MECHANIC') or hasRole('ADMIN')")
public class MechanicPartsRequestController {

    @GetMapping
    public ResponseEntity<List<MechanicPartsRequestDTO>> getRequestsForBooking(
            @PathVariable Long bookingId);

    @PostMapping
    public ResponseEntity<MechanicPartsRequestDTO> createPartsRequest(
            @PathVariable Long bookingId,
            @RequestBody CreatePartsRequestDTO request,
            Authentication authentication);

    @PutMapping("/{requestId}")
    public ResponseEntity<MechanicPartsRequestDTO> updateRequest(
            @PathVariable Long bookingId,
            @PathVariable Long requestId,
            @RequestBody UpdatePartsRequestDTO request);

    @PutMapping("/{requestId}/cancel")
    public ResponseEntity<?> cancelRequest(
            @PathVariable Long bookingId,
            @PathVariable Long requestId);

    @PostMapping("/{requestId}/use")
    public ResponseEntity<PartsUsageDTO> useApprovedParts(
            @PathVariable Long bookingId,
            @PathVariable Long requestId,
            @RequestBody UsePartsDTO request);

    @GetMapping("/inventory/search")
    public ResponseEntity<List<InventoryDTO>> searchInventory(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size);
}
```

#### Admin Endpoints

```java
@RestController
@RequestMapping("/api/admin/parts-requests")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPartsRequestController {

    @GetMapping
    public ResponseEntity<Page<MechanicPartsRequestDTO>> getAllRequests(
            @RequestParam(defaultValue = "PENDING") String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Long mechanicId,
            Pageable pageable);

    @GetMapping("/{requestId}")
    public ResponseEntity<DetailedPartsRequestDTO> getRequestDetails(
            @PathVariable Long requestId);

    @PutMapping("/{requestId}/approve")
    public ResponseEntity<MechanicPartsRequestDTO> approveRequest(
            @PathVariable Long requestId,
            @RequestBody ApproveRequestDTO request,
            Authentication authentication);

    @PutMapping("/{requestId}/reject")
    public ResponseEntity<?> rejectRequest(
            @PathVariable Long requestId,
            @RequestBody RejectRequestDTO request,
            Authentication authentication);

    @PostMapping("/bulk-approve")
    public ResponseEntity<BulkOperationResultDTO> bulkApproveRequests(
            @RequestBody BulkApprovalDTO requests,
            Authentication authentication);

    @PostMapping("/bulk-reject")
    public ResponseEntity<BulkOperationResultDTO> bulkRejectRequests(
            @RequestBody BulkRejectionDTO requests,
            Authentication authentication);

    @GetMapping("/analytics")
    public ResponseEntity<PartsRequestAnalyticsDTO> getRequestAnalytics(
            @RequestParam(required = false) String period,
            @RequestParam(required = false) Long mechanicId);
}
```

### Phase 7: Database Schema

```sql
-- Main parts request table
CREATE TABLE mechanic_parts_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    inventory_item_id BIGINT NOT NULL,
    requested_by_mechanic_id BIGINT NOT NULL,
    quantity_requested INT NOT NULL,
    quantity_approved INT DEFAULT 0,
    quantity_used INT DEFAULT 0,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'PARTIALLY_APPROVED', 'USED', 'CANCELLED') DEFAULT 'PENDING',
    priority ENUM('LOW', 'NORMAL', 'HIGH', 'CRITICAL') DEFAULT 'NORMAL',
    reason TEXT,
    admin_notes TEXT, -- Admin's notes when approving/rejecting
    approved_by_admin_id BIGINT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    used_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (inventory_item_id) REFERENCES inventory(id),
    FOREIGN KEY (requested_by_mechanic_id) REFERENCES users(id),
    FOREIGN KEY (approved_by_admin_id) REFERENCES users(id)
);

-- Parts usage tracking (detailed usage within a request)
CREATE TABLE mechanic_parts_usage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id BIGINT NOT NULL,
    quantity_used INT NOT NULL,
    usage_notes TEXT,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES mechanic_parts_requests(id)
);

-- Indexes for performance
CREATE INDEX idx_mechanic_requests_booking ON mechanic_parts_requests(booking_id);
CREATE INDEX idx_mechanic_requests_status ON mechanic_parts_requests(status);
CREATE INDEX idx_mechanic_requests_priority ON mechanic_parts_requests(priority);
CREATE INDEX idx_mechanic_requests_mechanic ON mechanic_parts_requests(requested_by_mechanic_id);
CREATE INDEX idx_mechanic_requests_approved_by ON mechanic_parts_requests(approved_by_admin_id);
CREATE INDEX idx_mechanic_requests_requested_at ON mechanic_parts_requests(requested_at);
CREATE INDEX idx_mechanic_usage_request ON mechanic_parts_usage(request_id);
```

### Phase 8: Frontend Integration

#### Enhanced Mechanic Booking Dashboard Component

```typescript
interface MechanicBookingDashboardProps {
  bookingId: number;
}

const MechanicBookingDashboard: React.FC<MechanicBookingDashboardProps> = ({ bookingId }) => {
  return (
    <div className="space-y-6">
      {/* Existing booking details */}
      <BookingDetailsCard bookingId={bookingId} />

      {/* Existing customer parts check-in */}
      <CustomerPartsCheckIn bookingId={bookingId} />

      {/* NEW: Workshop parts request section */}
      <WorkshopPartsRequestSection bookingId={bookingId} />

      {/* NEW: Service progress tracking */}
      <ServiceProgressTracker bookingId={bookingId} />
    </div>
  );
};
```

#### New Workshop Parts Request Component

```typescript
const WorkshopPartsRequestSection: React.FC<{ bookingId: number }> = ({ bookingId }) => {
  const [requests, setRequests] = useState<MechanicPartsRequest[]>([]);
  const [showRequestForm, setShowRequestForm] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workshop Parts Requests</CardTitle>
        <Button onClick={() => setShowRequestForm(true)}>
          + Request Parts
        </Button>
      </CardHeader>
      <CardContent>
        {/* Existing requests list */}
        <PartsRequestsList requests={requests} />

        {/* Request form modal */}
        {showRequestForm && (
          <PartsRequestModal
            bookingId={bookingId}
            onClose={() => setShowRequestForm(false)}
            onRequestCreated={refreshRequests}
          />
        )}
      </CardContent>
    </Card>
  );
};
```

### Phase 9: Integration Points

#### 1. Inventory System Integration

- Real-time stock checking during request creation
- Automatic inventory allocation when request is approved
- Inventory deduction when parts are actually used
- Low stock alerts triggering reorder suggestions

#### 2. Notification System Integration

- Real-time notifications for new requests (admin)
- Status update notifications (mechanic)
- Priority-based alert routing
- Email/SMS notifications for critical requests

#### 3. Billing System Integration

- Automatic cost calculation for workshop parts
- Integration with existing billing logic
- Clear separation of customer vs workshop parts costs
- Invoice generation with detailed parts breakdown

#### 4. Service History Integration

- Learn common parts patterns for specific services
- Suggest frequently used parts proactively
- Build knowledge base for future efficiency improvements

## Implementation Timeline

### Week 1: Backend Foundation

- Create MechanicPartsRequest entity and repository
- Implement basic CRUD service layer
- Add core API endpoints
- Database migration scripts

### Week 2: Admin Interface

- Build admin parts request management interface
- Implement approval/rejection workflow
- Add inventory availability checking
- Create notification system

### Week 3: Mechanic Interface

- Enhance mechanic booking dashboard
- Add parts request creation form
- Implement inventory search functionality
- Add request status tracking

### Week 4: Smart Features & Polish

- Implement smart recommendation engine
- Add auto-approval logic for trusted mechanics
- Create analytics and reporting
- Testing and bug fixes

## Key Benefits

✅ **Complete Workflow Coverage**: Mechanics can handle both customer and workshop parts seamlessly
✅ **Controlled Inventory Management**: Admin approval ensures proper inventory control and cost management
✅ **Real-time Decision Making**: Live inventory checking and smart recommendations
✅ **Cost Tracking & Billing**: Clear separation and tracking of parts costs for accurate billing
✅ **Audit Trail**: Complete tracking of all parts requests, approvals, and usage
✅ **Smart Automation**: AI-powered recommendations and auto-approval for efficiency
✅ **Scalable Architecture**: System grows with business needs and complexity

## Future Enhancements

- **Mobile app integration** for mechanics in the field
- **Voice-activated requests** for hands-free operation
- **Predictive parts ordering** based on service patterns
- **Supplier integration** for direct parts procurement
- **Customer notification** about additional parts needs
- **Parts warranty tracking** and management

---

**Status**: Phase 1-3 Complete - Full System Implementation Completed (September 3, 2025)  
**Priority**: High - Critical missing functionality RESOLVED ✅  
**Total Effort**: 1 development day for complete frontend implementation  
**Dependencies**: Existing inventory management system, booking system, notification system

## Phase 1-3 Implementation Complete ✅

### **Completed Components (September 3, 2025)**

#### ✅ **Backend Foundation - 100% Complete**

- **Request Entity**: Updated to use PENDING status by default (proper approval workflow)
- **RequestService**: Complete business logic with all validation rules
- **RequestController**: Full REST API with mechanic and admin endpoints  
- **Request DTOs**: RequestCreateDTO and RequestResponseDTO implemented
- **Business Rules**: Mechanics can only request parts for CONFIRMED/IN_PROGRESS bookings they're assigned to
- **Inventory Integration**: Stock validation and automatic deduction on approval
- **Security**: Proper role-based access control (@PreAuthorize annotations)

#### ✅ **API Endpoints Implemented**

**Mechanic Endpoints:**

- `POST /api/bookings/{bookingId}/requests` - Create parts request
- `GET /api/bookings/{bookingId}/requests` - Get requests for booking
- `GET /api/mechanics/me/requests` - Get mechanic's own requests
- `GET /api/bookings/{bookingId}/can-request-parts` - Validation endpoint

**Admin Endpoints:**

- `GET /api/admin/requests/pending` - Get pending requests
- `PUT /api/admin/requests/{requestId}/approve` - Approve request  
- `PUT /api/admin/requests/{requestId}/reject` - Reject request

#### ✅ **Business Logic Validation**

- ✅ Mechanic assignment validation
- ✅ Booking status validation (CONFIRMED/IN_PROGRESS only)
- ✅ Inventory stock checking
- ✅ Duplicate request prevention
- ✅ Proper error handling and messaging

#### ✅ **Frontend Implementation - 100% Complete (September 3, 2025)**

**PartsRequestWidget Component:**
- ✅ Complete parts request form with inventory dropdown
- ✅ Real-time inventory loading and stock filtering (qty > 0)
- ✅ Quantity validation (1-10 parts per request)
- ✅ Automatic reason generation with booking context
- ✅ Request submission with proper API integration
- ✅ Current requests display with part details and status
- ✅ Status indicators (⏳ Waiting approval, ✅ Approved, ❌ Rejected)
- ✅ Approved parts usage workflow with "Use" button
- ✅ Error handling and success notifications
- ✅ Loading states for better UX

**API Client Integration:**
- ✅ Complete API methods for parts request operations
- ✅ Fixed field mapping to match backend DTOs (partId, quantity, reason)
- ✅ Proper error handling and response processing
- ✅ Authentication token management for secure requests

**Mechanic Dashboard Integration:**
- ✅ Parts request widget integrated into booking cards
- ✅ Conditional display for CONFIRMED/IN_PROGRESS bookings only
- ✅ Seamless workflow within existing mechanic interface
- ✅ Real-time data synchronization

#### ✅ **Admin Management Interface - 100% Complete (September 3, 2025)**

**Admin Parts Request Management Page:**
- ✅ Complete admin interface at /dashboard/admin/parts-requests
- ✅ Pending requests queue with detailed information display
- ✅ Part details (name, quantity, price calculation)
- ✅ Mechanic and booking context information  
- ✅ Stock status validation and availability checking
- ✅ Cost calculation and total value tracking
- ✅ One-click approve/reject actions with proper API calls
- ✅ Recent activity log with request history
- ✅ Real-time statistics dashboard (pending count, approved count, total value)
- ✅ Responsive design with proper loading states
- ✅ Fixed interface field mapping to match backend response structure

**Data Structure Alignment:**
- ✅ Updated interfaces to match RequestResponseDTO structure
- ✅ Fixed field name mapping (inventoryItemPrice → partPrice, etc.)
- ✅ Proper TypeScript interfaces for type safety
- ✅ Corrected price calculations and display logic

## Full System Implementation Summary ✅

### **Complete End-to-End Workflow (September 3, 2025)**

1. **Mechanic Workflow:**
   - ✅ Mechanic views assigned booking (CONFIRMED/IN_PROGRESS)
   - ✅ Clicks "My Assignments" and sees PartsRequestWidget
   - ✅ Selects needed parts from available inventory dropdown
   - ✅ Specifies quantity (1-10) with real-time stock validation
   - ✅ Submits request with automatic reason generation
   - ✅ Sees request in "Current Requests" section with status
   - ✅ Can use approved parts via "Use" button

2. **Admin Workflow:**
   - ✅ Admin navigates to Parts Request Management page
   - ✅ Views pending requests with complete context (part, mechanic, booking)
   - ✅ Sees real-time inventory availability and cost calculations
   - ✅ Approves/rejects requests with single click
   - ✅ Views statistics dashboard with total pending value
   - ✅ Monitors recent activity and request history

3. **System Integration:**
   - ✅ Real inventory data loading from /api/parts endpoint
   - ✅ Stock filtering to show only available parts (qty > 0)
   - ✅ Proper authentication and role-based access control
   - ✅ Error handling for network issues and validation failures
   - ✅ Success notifications and user feedback
   - ✅ Data synchronization between mechanic and admin interfaces

### **Technical Implementation Details**

**Frontend Components Created/Updated:**
- ✅ `PartsRequestWidget.tsx` - Main mechanic interface component
- ✅ `/dashboard/admin/parts-requests/page.tsx` - Admin management interface
- ✅ Updated mechanic booking dashboard integration
- ✅ API client with complete parts request methods

**Backend Integration:**
- ✅ All existing backend APIs working properly
- ✅ Proper field mapping and data structure alignment
- ✅ Authentication and authorization working correctly
- ✅ Error handling and validation implemented

**Bug Fixes Completed:**
- ✅ Fixed API endpoint usage (changed from /inventory to /parts)
- ✅ Fixed interface field name mismatches
- ✅ Corrected API request structure to match backend DTOs
- ✅ Fixed price calculation and display issues (NaN errors resolved)
- ✅ Updated TypeScript interfaces for proper type safety

---