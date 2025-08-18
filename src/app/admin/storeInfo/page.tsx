import { NextPage } from 'next';
import { Tag, CalendarDays, Users, CalendarCheck, CalendarOff } from 'lucide-react';

// Define TypeScript interface for e-commerce store data
interface StoreData {
  store_id: string;
  store_name: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  email: string;
  phone_primary: string;
  phone_secondary: string;
  website_url: string;
  timezone: string;
  business_hours: string;
  latitude: string;
  longitude: string;
  tax_id: string;
  legal_name: string;
  subscription_plan_id: string;
  created_at: string;
}

// Define TypeScript interface for subscription plan
interface SubscriptionPlan {
  plan_id: string;
  plan_name: string;
  duration_months: number;
  max_products: number;
  color: string;
}

// Static data for the e-commerce store
const storeData: StoreData = {
  store_id: 'store_001',
  store_name: 'TechTrend Innovations',
  address: '123 Commerce Street',
  city: 'New York',
  postal_code: '10001',
  country: 'USA',
  email: 'contact@techtrend.com',
  phone_primary: '+1 (555) 123-4567',
  phone_secondary: '+1 (555) 987-6543',
  website_url: 'https://www.techtrend.com',
  timezone: 'America/New_York',
  business_hours: 'Mon-Fri: 9 AM - 6 PM, Sat: 10 AM - 4 PM',
  latitude: '40.7128',
  longitude: '-74.0060',
  tax_id: '12-3456789',
  legal_name: 'TechTrend Innovations LLC',
  subscription_plan_id: 'plan_premium_001',
  created_at: '2024-01-15',
};

// Static data for the subscription plan
const subscriptionPlan: SubscriptionPlan = {
  plan_id: 'plan_premium_001',
  plan_name: 'Premium E-Commerce Plan',
  duration_months: 12,
  max_products: 1000,
  color: '#1E90FF', // DodgerBlue for the plan card
};

// StoreInfo component
const StoreInfo: NextPage = () => {
  // Helper function to determine text color based on background luminance
  const getTextColorForBackground = (hexColor: string): string => {
    if (!hexColor || !hexColor.startsWith('#') || hexColor.length !== 7) {
      return 'text-white';
    }
    try {
      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      return luminance > 128 ? 'text-gray-800' : 'text-white';
    } catch (e) {
      console.error('Error parsing hex color:', hexColor, e);
      return 'text-white';
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // Calculate subscription plan dates
  const planStartDate = new Date(storeData.created_at);
  const planExpirationDate = new Date(planStartDate);
  planExpirationDate.setMonth(planStartDate.getMonth() + subscriptionPlan.duration_months);

  // Styles for the subscription plan card
  const planCardStyle = { backgroundColor: subscriptionPlan.color };
  const planTextClass = getTextColorForBackground(subscriptionPlan.color);
  const planButtonClasses =
    planTextClass === 'text-white'
      ? 'btn btn-outline text-white border-white hover:bg-white hover:text-gray-700 focus:bg-white focus:text-gray-700 btn-sm sm:btn-md'
      : 'btn btn-outline text-gray-800 border-gray-800 hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white btn-sm sm:btn-md';

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center text-primary">
          Store Information
        </h1>
      </div>

      {/* Store Information Card */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="form-control">
                <label className="label flex flex-col items-start">
                  <span className="label-text font-bold">Store Name</span>
                  <div className="input input-bordered w-full mt-2 bg-gray-100">
                    {storeData.store_name}
                  </div>
                </label>
              </div>
              <div className="form-control">
                <label className="label flex flex-col items-start">
                  <span className="label-text font-bold">Address</span>
                  <div className="input input-bordered w-full mt-2 bg-gray-100">
                    {storeData.address}
                  </div>
                </label>
              </div>
              <div className="form-control">
                <label className="label flex flex-col items-start">
                  <span className="label-text font-bold">City</span>
                  <div className="input input-bordered w-full mt-2 bg-gray-100">
                    {storeData.city}
                  </div>
                </label>
              </div>
              <div className="form-control">
                <label className="label flex flex-col items-start">
                  <span className="label-text font-bold">Postal Code</span>
                  <div className="input input-bordered w-full mt-2 bg-gray-100">
                    {storeData.postal_code}
                  </div>
                </label>
              </div>
              <div className="form-control">
                <label className="label flex flex-col items-start">
                  <span className="label-text font-bold">Country</span>
                  <div className="input input-bordered w-full mt-2 bg-gray-100">
                    {storeData.country}
                  </div>
                </label>
              </div>
              <div className="form-control">
                <label className="label flex flex-col items-start">
                  <span className="label-text font-bold">Email</span>
                  <div className="input input-bordered w-full mt-2 bg-gray-100">
                    {storeData.email}
                  </div>
                </label>
              </div>
              <div className="form-control">
                <label className="label flex flex-col items-start">
                  <span className="label-text font-bold">Primary Phone</span>
                  <div className="input input-bordered w-full mt-2 bg-gray-100">
                    {storeData.phone_primary}
                  </div>
                </label>
              </div>
              <div className="form-control">
                <label className="label flex flex-col items-start">
                  <span className="label-text font-bold">Secondary Phone</span>
                  <div className="input input-bordered w-full mt-2 bg-gray-100">
                    {storeData.phone_secondary || 'N/A'}
                  </div>
                </label>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="form-control">
                <label className="label flex flex-col items-start">
                  <span className="label-text font-bold">Website URL</span>
                  <div className="input input-bordered w-full mt-2 bg-gray-100">
                    <a
                      href={storeData.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {storeData.website_url}
                    </a>
                  </div>
                </label>
              </div>
              <div className="form-control">
                <label className="label flex flex-col items-start">
                  <span className="label-text font-bold">Timezone</span>
                  <div className="input input-bordered w-full mt-2 bg-gray-100">
                    {storeData.timezone}
                  </div>
                </label>
              </div>
              <div className="form-control">
                <label className="label flex flex-col items-start">
                  <span className="label-text font-bold">Business Hours</span>
                  <div className="input input-bordered w-full mt-2 bg-gray-100">
                    {storeData.business_hours}
                  </div>
                </label>
              </div>
              <div className="form-control">
                <label className="label flex flex-col items-start">
                  <span className="label-text font-bold">Latitude</span>
                  <div className="input input-bordered w-full mt-2 bg-gray-100">
                    {storeData.latitude}
                  </div>
                </label>
              </div>
              <div className="form-control">
                <label className="label flex flex-col items-start">
                  <span className="label-text font-bold">Longitude</span>
                  <div className="input input-bordered w-full mt-2 bg-gray-100">
                    {storeData.longitude}
                  </div>
                </label>
              </div>
              <div className="form-control">
                <label className="label flex flex-col items-start">
                  <span className="label-text font-bold">Tax ID</span>
                  <div className="input input-bordered w-full mt-2 bg-gray-100">
                    {storeData.tax_id}
                  </div>
                </label>
              </div>
              <div className="form-control">
                <label className="label flex flex-col items-start">
                  <span className="label-text font-bold">Legal Name</span>
                  <div className="input input-bordered w-full mt-2 bg-gray-100">
                    {storeData.legal_name}
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Plan Card */}
      <div className="card shadow-xl mt-6 rounded-lg" style={planCardStyle}>
        <div className={`card-body p-4 sm:p-6 ${planTextClass}`}>
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="card-title text-xl sm:text-2xl font-bold">
              Current Subscription Plan
            </h2>
            <a
              href="/pricing"
              className={planButtonClasses}
            >
              View Available Plans
            </a>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <p className="flex items-center text-lg">
                <Tag size={20} className="mr-3 opacity-90 flex-shrink-0" />
                <span>
                  <strong>Name:</strong> {subscriptionPlan.plan_name}
                </span>
              </p>
              <p className="flex items-center text-lg">
                <CalendarCheck size={20} className="mr-3 opacity-90 flex-shrink-0" />
                <span>
                  <strong>Start:</strong> {formatDate(storeData.created_at)}
                </span>
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <p className="flex items-center text-lg">
                <CalendarDays size={20} className="mr-3 opacity-90 flex-shrink-0" />
                <span>
                  <strong>Duration:</strong> {subscriptionPlan.duration_months} months
                </span>
              </p>
              <p className="flex items-center text-lg">
                <CalendarOff size={20} className="mr-3 opacity-90 flex-shrink-0" />
                <span>
                  <strong>Expiration:</strong> {formatDate(planExpirationDate.toISOString())}
                </span>
              </p>
            </div>
            <p className="flex items-center text-lg">
              <Users size={20} className="mr-3 opacity-90 flex-shrink-0" />
              <span>
                <strong>Max Products:</strong> {subscriptionPlan.max_products}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreInfo;