'use client';

import React, { useState } from 'react';
import { apiClient } from '@/lib/api';

export default function DebugPanel() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDebugCheck = async () => {
    setLoading(true);
    const debug: any = {};
    
    try {
      // Check user info
      console.log('🔍 Testing user info...');
      const userInfo = await apiClient.debugUserInfo();
      debug.userInfo = userInfo;
      console.log('✅ User info:', userInfo);

      // Check inventory count
      console.log('🔍 Testing inventory count...');
      const inventoryCount = await apiClient.debugInventoryCount();
      debug.inventoryCount = inventoryCount;
      console.log('✅ Inventory count:', inventoryCount);

      // Check if we can get cart
      console.log('🔍 Testing get cart...');
      try {
        const cart = await apiClient.getCart();
        debug.cart = { success: true, data: cart };
        console.log('✅ Get cart:', cart);
      } catch (error) {
        debug.cart = { success: false, error: error };
        console.log('❌ Get cart error:', error);
      }

    } catch (error) {
      debug.error = error;
      console.error('💥 Debug check failed:', error);
    }

    setDebugInfo(debug);
    setLoading(false);
  };

  const testAddToCart = async (inventoryId: number = 1) => {
    setLoading(true);
    try {
      console.log('🔍 Testing add to cart with inventory ID:', inventoryId);
      
      // First check if inventory item exists
      const inventoryInfo = await apiClient.debugInventoryInfo(inventoryId);
      console.log('📦 Inventory info:', inventoryInfo);
      
      if (!inventoryInfo.inventoryFound) {
        console.warn('⚠️ Inventory item not found, trying ID 1');
        inventoryId = 1;
      }

      // Try to add to cart
      const result = await apiClient.addToCart({
        inventoryId: inventoryId,
        quantity: 1
      });
      
      console.log('✅ Add to cart success:', result);
      setDebugInfo({...debugInfo, addToCart: { success: true, data: result }});
      
    } catch (error) {
      console.error('❌ Add to cart failed:', error);
      setDebugInfo({...debugInfo, addToCart: { success: false, error: error }});
    }
    setLoading(false);
  };

  return (
    <div className="bg-yellow-100 p-4 rounded-lg mb-4 border-2 border-yellow-400">
      <h3 className="text-lg font-bold text-yellow-800 mb-3">🐛 Debug Panel</h3>
      
      <div className="space-x-2 mb-4">
        <button
          onClick={runDebugCheck}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Run Debug Check'}
        </button>
        
        <button
          onClick={() => testAddToCart()}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Add to Cart'}
        </button>

        <button
          onClick={() => setDebugInfo(null)}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Clear
        </button>
      </div>

      {debugInfo && (
        <div className="bg-white p-3 rounded border">
          <h4 className="font-bold mb-2">Debug Results:</h4>
          <pre className="text-xs overflow-x-auto bg-gray-100 p-2 rounded">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}

      <div className="text-sm text-yellow-700 mt-2">
        <p>• Check browser console for detailed API logs</p>
        <p>• Check backend console for server-side logs</p>
      </div>
    </div>
  );
}