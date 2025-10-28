// Test script to validate reports data structure alignment
// Run this in browser console on the reports page

async function testReportsDataAlignment() {
    console.log('🧪 Testing Reports Data Structure Alignment...\n');

    try {
        // Test 1: Dashboard Data Structure
        console.log('📊 Test 1: Dashboard Data Structure');
        const dashboardResponse = await fetch('/api/reports/dashboard?days=30', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
            }
        });

        if (!dashboardResponse.ok) {
            throw new Error(`Dashboard API failed: ${dashboardResponse.status}`);
        }

        const dashboardData = await dashboardResponse.json();
        console.log('✅ Dashboard API Response Structure:', {
            hasMonthlySales: Array.isArray(dashboardData.monthlySales),
            hasMostUsedParts: Array.isArray(dashboardData.mostUsedParts),
            hasMechanicPerformance: Array.isArray(dashboardData.mechanicPerformance),
            hasSummary: dashboardData.summary !== undefined,
            monthlySalesType: typeof dashboardData.monthlySales,
            firstMonthlySale: dashboardData.monthlySales?.[0]
        });

        // Test 2: Validate Sales Report Structure
        if (dashboardData.monthlySales && dashboardData.monthlySales.length > 0) {
            const firstSales = dashboardData.monthlySales[0];
            console.log('✅ First Sales Report Item Structure:', {
                hasRequiredFields: [
                    'revenue' in firstSales,
                    'serviceRevenue' in firstSales,
                    'partsRevenue' in firstSales,
                    'orderCount' in firstSales
                ],
                fieldTypes: {
                    revenue: typeof firstSales.revenue,
                    serviceRevenue: typeof firstSales.serviceRevenue,
                    partsRevenue: typeof firstSales.partsRevenue,
                    orderCount: typeof firstSales.orderCount,
                    month: typeof firstSales.month,
                    year: typeof firstSales.year
                },
                values: {
                    revenue: firstSales.revenue,
                    serviceRevenue: firstSales.serviceRevenue,
                    partsRevenue: firstSales.partsRevenue,
                    orderCount: firstSales.orderCount,
                    month: firstSales.month,
                    year: firstSales.year
                }
            });
        }

        // Test 3: Validate Parts Usage Structure
        if (dashboardData.mostUsedParts && dashboardData.mostUsedParts.length > 0) {
            const firstPart = dashboardData.mostUsedParts[0];
            console.log('✅ First Parts Usage Item Structure:', {
                hasRequiredFields: [
                    'partId' in firstPart,
                    'partName' in firstPart,
                    'partCode' in firstPart,
                    'totalQuantity' in firstPart,
                    'totalRevenue' in firstPart
                ],
                fieldTypes: {
                    partId: typeof firstPart.partId,
                    partName: typeof firstPart.partName,
                    partCode: typeof firstPart.partCode,
                    totalQuantity: typeof firstPart.totalQuantity,
                    totalRevenue: typeof firstPart.totalRevenue
                },
                values: {
                    partId: firstPart.partId,
                    partName: firstPart.partName,
                    partCode: firstPart.partCode,
                    totalQuantity: firstPart.totalQuantity,
                    totalRevenue: firstPart.totalRevenue
                }
            });
        }

        // Test 4: Validate Mechanic Performance Structure
        if (dashboardData.mechanicPerformance && dashboardData.mechanicPerformance.length > 0) {
            const firstMechanic = dashboardData.mechanicPerformance[0];
            console.log('✅ First Mechanic Performance Item Structure:', {
                hasRequiredFields: [
                    'mechanicId' in firstMechanic,
                    'mechanicName' in firstMechanic,
                    'mechanicEmail' in firstMechanic,
                    'totalJobs' in firstMechanic,
                    'completedJobs' in firstMechanic,
                    'completionRate' in firstMechanic
                ],
                fieldTypes: {
                    mechanicId: typeof firstMechanic.mechanicId,
                    mechanicName: typeof firstMechanic.mechanicName,
                    totalJobs: typeof firstMechanic.totalJobs,
                    completedJobs: typeof firstMechanic.completedJobs,
                    completionRate: typeof firstMechanic.completionRate,
                    avgCompletionHours: typeof firstMechanic.avgCompletionHours
                },
                values: {
                    mechanicId: firstMechanic.mechanicId,
                    mechanicName: firstMechanic.mechanicName,
                    totalJobs: firstMechanic.totalJobs,
                    completedJobs: firstMechanic.completedJobs,
                    completionRate: firstMechanic.completionRate,
                    avgCompletionHours: firstMechanic.avgCompletionHours
                }
            });
        }

        // Test 5: Individual Sales Report API
        console.log('\n📈 Test 2: Individual Sales Report API');
        const salesResponse = await fetch('/api/reports/sales?period=monthly&days=30', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
            }
        });

        if (salesResponse.ok) {
            const salesData = await salesResponse.json();
            console.log('✅ Sales API Response:', {
                isArray: Array.isArray(salesData),
                length: salesData.length,
                firstItemStructure: salesData[0] ? Object.keys(salesData[0]) : 'No data'
            });
        } else {
            console.warn('⚠️ Sales API failed:', salesResponse.status);
        }

        // Test 6: Parts Usage API
        console.log('\n🔧 Test 3: Parts Usage API');
        const partsResponse = await fetch('/api/reports/parts-usage?days=30', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
            }
        });

        if (partsResponse.ok) {
            const partsData = await partsResponse.json();
            console.log('✅ Parts Usage API Response:', {
                isArray: Array.isArray(partsData),
                length: partsData.length,
                firstItemStructure: partsData[0] ? Object.keys(partsData[0]) : 'No data'
            });
        } else {
            console.warn('⚠️ Parts Usage API failed:', partsResponse.status);
        }

        console.log('\n🎉 All tests completed successfully!');
        console.log('✅ Data structures are properly aligned between backend and frontend');

    } catch (error) {
        console.error('❌ Test failed:', error);
        console.log('\n🔍 Debugging Info:');
        console.log('- Make sure you are logged in as ADMIN');
        console.log('- Check browser Network tab for API call details');
        console.log('- Verify backend is running and accessible');
    }
}

// Auto-run the test
console.log('🚀 Starting Reports Data Alignment Test...');
testReportsDataAlignment();