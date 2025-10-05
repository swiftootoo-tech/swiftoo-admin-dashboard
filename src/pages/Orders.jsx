// src/pages/Orders.jsx
import React, { useEffect, useState } from 'react';
import API from '../api';
import AdminNavbar from './AdminNavbar';
import "./AdminDashboard.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // Track which order is being updated

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    API.get('/api/orders/all')
      .then((res) => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch orders:', err);
        setLoading(false);
      });
  };

  const markAsDelivered = async (orderId) => {
    setUpdating(orderId);
    try {
      await API.patch(`/api/orders/${orderId}/status`, { status: 'Delivered' });
      fetchOrders();
    } catch (err) {
      alert('Failed to update order status.');
      console.error(err);
    }
    setUpdating(null);
  };

  return (
    <div className="admin-dashboard">
      <AdminNavbar />
      <div className="welcome-section">
        <h2>All Customer Orders</h2>
        <p>Manage and review all customer orders here.</p>
      </div>
      <h2 className="section-title">Orders List</h2>
      <div className="table-container">
        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="no-products">No orders yet.</div>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Address</th>
                <th>GPS Location</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Dispatch Details</th>
                <th>Status</th>
                <th>Placed At</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                console.log('Order object:', order); // Debug log
                const status = order.status || order.dispatchDetails?.status || '';
                const isDelivered = typeof status === 'string' && status.trim().toLowerCase() === 'delivered';
                return (
                  <tr key={order._id}>
                    <td>
                      <strong>{order.customerName}</strong><br />
                      <span style={{ color: '#888', fontSize: '0.95em' }}>{order.customerPhone}</span>
                    </td>
                    <td>
                      {order.address ? (
                        <span>{order.address}</span>
                      ) : (
                        <span style={{ color: '#888', fontStyle: 'italic' }}>No Address</span>
                      )}
                    </td>
                    <td>
                      {order.gpsLocation ? (
                        <span>{order.gpsLocation}</span>
                      ) : (
                        <span style={{ color: '#888', fontStyle: 'italic' }}>No GPS</span>
                      )}
                    </td>
                    <td>
                      <ul style={{ paddingLeft: 18, margin: 0 }}>
                        {order.items.map((item, idx) => (
                          <li key={idx} style={{ marginBottom: 2 }}>{item.name} <span style={{ color: '#6a1b9a', fontWeight: 600 }}>× {item.quantity}</span></li>
                        ))}
                      </ul>
                    </td>
                    <td style={{ fontWeight: 600, color: '#6a1b9a' }}>₹{(order.total).toFixed(2)}</td>
                    <td>{order.paymentMethod}</td>
                    <td>
                      {order.dispatchDetails && order.dispatchDetails.date && order.dispatchDetails.time ? (
                        // If date and time are separate fields
                        (() => {
                          const dateStr = order.dispatchDetails.date;
                          const timeStr = order.dispatchDetails.time;
                          // Try to parse and format
                          let formatted = dateStr;
                          if (dateStr && timeStr) {
                            // If time is already in AM/PM, just join
                            if (/am|pm/i.test(timeStr)) {
                              formatted = `${dateStr} ${timeStr}`;
                            } else {
                              // Try to format to AM/PM
                              const [hour, minute] = timeStr.split(":");
                              let h = parseInt(hour, 10);
                              const ampm = h >= 12 ? "PM" : "AM";
                              h = h % 12 || 12;
                              formatted = `${dateStr} ${h}:${minute} ${ampm}`;
                            }
                          }
                          return <span>{formatted}</span>;
                        })()
                      ) : order.dispatchDetails && typeof order.dispatchDetails === 'string' ? (
                        (() => {
                          // Example: '2025-07-08T00:00:00.000 11:35 AM'
                          const match = order.dispatchDetails.match(/^(\d{4}-\d{2}-\d{2})T.* (\d{1,2}:\d{2} [AP]M)$/);
                          if (match) {
                            const date = match[1];
                            const time = match[2];
                            return <span>{date}<br />{time}</span>;
                          }
                          // Otherwise, display as is
                          return <span>{order.dispatchDetails}</span>;
                        })()
                      ) : (
                        <span style={{ color: '#888', fontStyle: 'italic' }}>No Dispatch Info</span>
                      )}
                    </td>
                    <td>
                      {isDelivered ? (
                        <span style={{ color: '#388e3c', fontWeight: 600 }}>Delivered</span>
                      ) : (
                        <button
                          className="add-product-btn"
                          style={{ padding: '6px 18px', fontSize: '0.95rem', background: '#6a1b9a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                          disabled={updating === order._id}
                          onClick={() => markAsDelivered(order._id)}
                        >
                          {updating === order._id ? 'Updating...' : 'Mark as Delivered'}
                        </button>
                      )}
                    </td>
                    <td>{new Date(order.createdAt).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Orders;
