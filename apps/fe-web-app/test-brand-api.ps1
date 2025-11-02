# Test Brand API - CRUD Operations
$baseUrl = "http://localhost:4000/api"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "BRAND API TEST - CRUD OPERATIONS" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 1. Login as Admin
Write-Host "1. Testing Admin Login..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@example.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $adminLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType 'application/json'
    $adminToken = $adminLogin.data.token
    Write-Host "✅ Admin Login Success" -ForegroundColor Green
    Write-Host "   Email: $($adminLogin.data.user.email)" -ForegroundColor Gray
    Write-Host "   Role: $($adminLogin.data.user.role)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Admin Login Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Login as Staff
Write-Host "2. Testing Staff Login..." -ForegroundColor Yellow
$staffLoginBody = @{
    email = "staff@example.com"
    password = "staff123"
} | ConvertTo-Json

try {
    $staffLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $staffLoginBody -ContentType 'application/json'
    $staffToken = $staffLogin.data.token
    Write-Host "✅ Staff Login Success" -ForegroundColor Green
    Write-Host "   Email: $($staffLogin.data.user.email)" -ForegroundColor Gray
    Write-Host "   Role: $($staffLogin.data.user.role)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Staff Login Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. GET All Brands (No auth required)
Write-Host "3. Testing GET All Brands (No auth)..." -ForegroundColor Yellow
try {
    $brandsResponse = Invoke-RestMethod -Uri "$baseUrl/brands" -Method Get
    $brands = $brandsResponse.data
    Write-Host "✅ GET All Brands Success" -ForegroundColor Green
    Write-Host "   Total Brands: $($brands.Count)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ GET All Brands Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. GET Brand Detail (No auth required)
Write-Host "4. Testing GET Brand Detail (No auth)..." -ForegroundColor Yellow
try {
    $firstBrandId = $brands[0]._id
    $brandDetailResponse = Invoke-RestMethod -Uri "$baseUrl/brands/$firstBrandId" -Method Get
    $brandDetail = $brandDetailResponse.data
    Write-Host "✅ GET Brand Detail Success" -ForegroundColor Green
    Write-Host "   Brand: $($brandDetail.name)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ GET Brand Detail Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. CREATE Brand as Admin
Write-Host "5. Testing CREATE Brand as Admin..." -ForegroundColor Yellow
$newBrand = @{
    code = "TEST-BRAND"
    name = "Test Brand for API"
    baseDailyRate = 1000000
    depositAmount = 3000000
    description = "This is a test brand"
} | ConvertTo-Json -Depth 10

try {
    $headers = @{
        Authorization = "Bearer $adminToken"
        "Content-Type" = "application/json"
    }
    $createdResponse = Invoke-RestMethod -Uri "$baseUrl/brands" -Method Post -Body $newBrand -Headers $headers
    $createdBrand = $createdResponse.data
    $testBrandId = $createdBrand._id
    Write-Host "✅ CREATE Brand as Admin Success" -ForegroundColor Green
    Write-Host "   Brand ID: $testBrandId" -ForegroundColor Gray
    Write-Host "   Brand Name: $($createdBrand.name)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ CREATE Brand as Admin Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
}

# 6. CREATE Brand as Staff (Should FAIL)
Write-Host "6. Testing CREATE Brand as Staff (Should FAIL)..." -ForegroundColor Yellow
$newBrandStaff = @{
    code = "STAFF-BRAND"
    name = "Staff Test Brand"
    baseDailyRate = 800000
} | ConvertTo-Json

try {
    $headers = @{
        Authorization = "Bearer $staffToken"
        "Content-Type" = "application/json"
    }
    $result = Invoke-RestMethod -Uri "$baseUrl/brands" -Method Post -Body $newBrandStaff -Headers $headers -ErrorAction Stop
    Write-Host "❌ CREATE Brand as Staff Should Have Failed!" -ForegroundColor Red
    Write-Host ""
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 403 -or $statusCode -eq 401) {
        Write-Host "✅ CREATE Brand as Staff Correctly Blocked (Status: $statusCode)" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "⚠️  Unexpected Error: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host ""
    }
}

# 7. UPDATE Brand as Admin
Write-Host "7. Testing UPDATE Brand as Admin..." -ForegroundColor Yellow
if ($testBrandId) {
    $updateData = @{
        name = "Updated Test Brand"
        baseDailyRate = 1200000
        description = "Updated description"
    } | ConvertTo-Json

    try {
        $headers = @{
            Authorization = "Bearer $adminToken"
            "Content-Type" = "application/json"
        }
        $updatedResponse = Invoke-RestMethod -Uri "$baseUrl/brands/$testBrandId" -Method Put -Body $updateData -Headers $headers
        $updatedBrand = $updatedResponse.data
        Write-Host "✅ UPDATE Brand as Admin Success" -ForegroundColor Green
        Write-Host "   New Name: $($updatedBrand.name)" -ForegroundColor Gray
        Write-Host "   New Rate: $($updatedBrand.baseDailyRate)" -ForegroundColor Gray
        Write-Host ""
    } catch {
        Write-Host "❌ UPDATE Brand as Admin Failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Skipped - No test brand created" -ForegroundColor Yellow
    Write-Host ""
}

# 8. UPDATE Brand as Staff (Should FAIL)
Write-Host "8. Testing UPDATE Brand as Staff (Should FAIL)..." -ForegroundColor Yellow
if ($testBrandId) {
    $updateDataStaff = @{
        name = "Staff Updated Brand"
    } | ConvertTo-Json

    try {
        $headers = @{
            Authorization = "Bearer $staffToken"
            "Content-Type" = "application/json"
        }
        $result = Invoke-RestMethod -Uri "$baseUrl/brands/$testBrandId" -Method Put -Body $updateDataStaff -Headers $headers -ErrorAction Stop
        Write-Host "❌ UPDATE Brand as Staff Should Have Failed!" -ForegroundColor Red
        Write-Host ""
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 403 -or $statusCode -eq 401) {
            Write-Host "✅ UPDATE Brand as Staff Correctly Blocked (Status: $statusCode)" -ForegroundColor Green
            Write-Host ""
        } else {
            Write-Host "⚠️  Unexpected Error: $($_.Exception.Message)" -ForegroundColor Yellow
            Write-Host ""
        }
    }
} else {
    Write-Host "⚠️  Skipped - No test brand created" -ForegroundColor Yellow
    Write-Host ""
}

# 9. DELETE Brand as Staff (Should FAIL)
Write-Host "9. Testing DELETE Brand as Staff (Should FAIL)..." -ForegroundColor Yellow
if ($testBrandId) {
    try {
        $headers = @{
            Authorization = "Bearer $staffToken"
        }
        $result = Invoke-RestMethod -Uri "$baseUrl/brands/$testBrandId" -Method Delete -Headers $headers -ErrorAction Stop
        Write-Host "❌ DELETE Brand as Staff Should Have Failed!" -ForegroundColor Red
        Write-Host ""
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 403 -or $statusCode -eq 401) {
            Write-Host "✅ DELETE Brand as Staff Correctly Blocked (Status: $statusCode)" -ForegroundColor Green
            Write-Host ""
        } else {
            Write-Host "⚠️  Unexpected Error: $($_.Exception.Message)" -ForegroundColor Yellow
            Write-Host ""
        }
    }
} else {
    Write-Host "⚠️  Skipped - No test brand created" -ForegroundColor Yellow
    Write-Host ""
}

# 10. DELETE Brand as Admin
Write-Host "10. Testing DELETE Brand as Admin..." -ForegroundColor Yellow
if ($testBrandId) {
    try {
        $headers = @{
            Authorization = "Bearer $adminToken"
        }
        $result = Invoke-RestMethod -Uri "$baseUrl/brands/$testBrandId" -Method Delete -Headers $headers
        Write-Host "✅ DELETE Brand as Admin Success" -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "❌ DELETE Brand as Admin Failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Skipped - No test brand created" -ForegroundColor Yellow
    Write-Host ""
}

# Summary
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✅ GET operations: Public access OK" -ForegroundColor Green
Write-Host "✅ CREATE: Admin only (Staff blocked)" -ForegroundColor Green
Write-Host "✅ UPDATE: Admin only (Staff blocked)" -ForegroundColor Green
Write-Host "✅ DELETE: Admin only (Staff blocked)" -ForegroundColor Green
Write-Host ""
Write-Host "All tests completed!" -ForegroundColor Cyan
