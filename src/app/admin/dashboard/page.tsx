import { NextPage } from 'next';

// Define TypeScript interface for e-commerce data
interface EcommerceData {
  total_sales: number;
  total_orders: number;
  unique_customers: number;
  average_order_value: number;
  product_views: number;
  cart_additions: number;
  checkout_conversions: number;
  active_products: number;
  out_of_stock_products: number;
  customer_reviews: number;
  pending_orders: number;
  return_requests: number;
  visitor_traffic: number;
}

// Dashboard component
const Dashboard: NextPage = () => {
  const ecommerceData: EcommerceData = {
    total_sales: 12500.75,
    total_orders: 150,
    unique_customers: 95,
    average_order_value: 83.34,
    product_views: 1200,
    cart_additions: 300,
    checkout_conversions: 150,
    active_products: 250,
    out_of_stock_products: 15,
    customer_reviews: 85,
    pending_orders: 10,
    return_requests: 5,
    visitor_traffic: 2000,
  };

  const conversionRate = ecommerceData.total_orders > 0 
    ? ((ecommerceData.checkout_conversions / ecommerceData.cart_additions) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="container mx-auto p-6">
      {/* Financial Statistics */}
      <div className="stats stats-vertical lg:stats-horizontal shadow w-full mb-6 border-2 border-primary">
        <div className="stat ">
          <div className="stat-figure text-primary ">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-title">Total Sales</div>
          <div className="stat-value text-primary">${ecommerceData.total_sales.toFixed(2)}</div>
          <div className="stat-desc">Revenue from all orders</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="stat-title">Total Orders</div>
          <div className="stat-value">{ecommerceData.total_orders}</div>
          <div className="stat-desc">Completed purchases</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-success">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v11.494m0 0a2.373 2.373 0 004.746 0M12 17.747a2.373 2.373 0 01-4.746 0M12 17.747v-2.247M6.253 15.374V6.253m0 0L3.5 8.5m2.753-2.247L8.5 3.5M17.747 8.626V17.747m0 0l2.753-2.247m-2.753 2.247l-2.247 2.753" />
            </svg>
          </div>
          <div className="stat-title">Average Order Value</div>
          <div className="stat-value">${ecommerceData.average_order_value.toFixed(2)}</div>
          <div className="stat-desc">Per transaction</div>
        </div>
      </div>

      {/* Customer and Product Statistics */}
      <div className="stats stats-vertical lg:stats-horizontal shadow w-full mb-6 border-2 border-primary">
        <div className="stat">
          <div className="stat-figure text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="stat-title">Unique Customers</div>
          <div className="stat-value">{ecommerceData.unique_customers}</div>
          <div className="stat-desc">Total buyers</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-title">Active Products</div>
          <div className="stat-value">{ecommerceData.active_products}</div>
          <div className="stat-desc">{ecommerceData.out_of_stock_products} out of stock</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-success">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div className="stat-title">Customer Reviews</div>
          <div className="stat-value">{ecommerceData.customer_reviews}</div>
          <div className="stat-desc">Total feedback received</div>
        </div>
      </div>

      {/* Shopping Behavior */}
      <div className="stats stats-vertical lg:stats-horizontal shadow w-full mb-6 border-2 border-primary">
        <div className="stat">
          <div className="stat-figure text-warning">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-title">Product Views</div>
          <div className="stat-value">{ecommerceData.product_views}</div>
          <div className="stat-desc">Total product page visits</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="stat-title">Cart Additions</div>
          <div className="stat-value">{ecommerceData.cart_additions}</div>
          <div className="stat-desc">Items added to cart</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="stat-title">Checkout Conversions</div>
          <div className="stat-value">{ecommerceData.checkout_conversions}</div>
          <div className="stat-desc">Completed purchases</div>
        </div>
      </div>

      {/* Key Metrics and Visitor Activity */}
      <div className="flex flex-col lg:flex-row lg:space-x-6 mb-6">
        {/* Key Metrics Card */}
        <div className="w-full lg:w-1/2 mb-6 lg:mb-0">
          <h2 className="text-2xl font-semibold mb-4">Key Metrics</h2>
          <div className="stats shadow w-full border-2 border-primary">
            <div className="stat">
              <div className="stat-figure text-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="stat-title">Conversion Rate</div>
              <div className="stat-value">{conversionRate}%</div>
              <div className="stat-desc">{ecommerceData.checkout_conversions} checkouts / {ecommerceData.cart_additions} cart additions</div>
            </div>
          </div>
        </div>

        {/* Visitor Activity Card */}
        <div className="w-full lg:w-1/2">
          <h2 className="text-2xl font-semibold mb-4">Visitor Activity</h2>
          <div className="stats shadow w-full border-2 border-primary">
            <div className="stat">
              <div className="stat-figure text-accent">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="stat-title">Visitor Traffic</div>
              <div className="stat-value">{ecommerceData.visitor_traffic}</div>
              <div className="stat-desc">Total site visits</div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Management */}
      <div className="stats stats-vertical lg:stats-horizontal shadow w-full mb-6 border-2 border-primary">
        <div className="stat">
          <div className="stat-figure text-warning">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="stat-title">Pending Orders</div>
          <div className="stat-value">{ecommerceData.pending_orders}</div>
          <div className="stat-desc">Orders awaiting processing</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div className="stat-title">Return Requests</div>
          <div className="stat-value">{ecommerceData.return_requests}</div>
          <div className="stat-desc">Pending returns</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;