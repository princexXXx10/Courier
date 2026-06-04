import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/database.types';

export type Delivery = Database['public']['Tables']['deliveries']['Row'];
export type TimelineEvent = Database['public']['Tables']['timeline_events']['Row'];

export interface DeliveryWithTimeline extends Delivery {
  timeline: TimelineEvent[];
}

export interface TrackingData {
  trackingCode: string;
  status: 'in-transit' | 'out-for-delivery' | 'delivered' | 'delayed' | 'failed';
  statusText: string;
  eta: string;
  progress: number;
  origin: {
    city: string;
    code: string;
    date: string;
    coordinates: [number, number];
  };
  destination: {
    city: string;
    code: string;
    eta: string;
    coordinates: [number, number];
  };
  currentLocation: {
    city: string;
    status: string;
    coordinates: [number, number];
  };
  packageDetails: {
    weight: string;
    dimensions: string;
    service: string;
    courier: string;
  };
  timeline: {
    time: string;
    date: string;
    title: string;
    location: string;
    status: string;
  }[];
  assignedCourier?: string;
  customerName?: string;
  customerId?: string;
}

const mapToTrackingData = (dbData: any): TrackingData => {
  return {
    trackingCode: dbData.tracking_code,
    status: dbData.status as any,
    statusText: dbData.status_text,
    eta: dbData.eta || 'TBD',
    progress: dbData.progress || 0,
    origin: {
      city: dbData.origin_city,
      code: dbData.origin_code || '',
      date: dbData.origin_date || '',
      coordinates: [Number(dbData.origin_lat), Number(dbData.origin_lng)] as [number, number]
    },
    destination: {
      city: dbData.destination_city,
      code: dbData.destination_code || '',
      eta: dbData.destination_eta || '',
      coordinates: [Number(dbData.destination_lat), Number(dbData.destination_lng)] as [number, number]
    },
    currentLocation: {
      city: dbData.current_city,
      status: dbData.current_status || '',
      coordinates: [Number(dbData.current_lat), Number(dbData.current_lng)] as [number, number]
    },
    packageDetails: {
      weight: dbData.weight || '',
      dimensions: dbData.dimensions || '',
      service: dbData.service || '',
      courier: dbData.courier_name || ''
    },
    timeline: (dbData.timeline || []).map((t: any) => ({
      time: t.event_time,
      date: t.event_date,
      title: t.title,
      location: t.location,
      status: t.status
    })),
    assignedCourier: dbData.assigned_courier || '',
    customerName: dbData.customer_name || '',
    customerId: dbData.customer_id || ''
  };
};

export const deliveryService = {
  async getDeliveryByCode(code: string): Promise<TrackingData | null> {
    const { data, error } = await supabase
      .from('deliveries')
      .select('*, timeline:timeline_events(*)')
      .eq('tracking_code', code)
      .order('event_time', { foreignTable: 'timeline_events', ascending: false });

    if (error || !data || data.length === 0) {
      console.error('Error fetching delivery:', error);
      return null;
    }

    return mapToTrackingData(data[0]);
  },

  async getAllDeliveries(): Promise<TrackingData[]> {
    const { data, error } = await supabase
      .from('deliveries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all deliveries:', error);
      return [];
    }

    return data.map(mapToTrackingData);
  },

  async getDeliveriesByCustomerId(customerId: string): Promise<TrackingData[]> {
    const { data, error } = await supabase
      .from('deliveries')
      .select('*, timeline:timeline_events(*)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customer deliveries:', error);
      return [];
    }

    return data.map(mapToTrackingData);
  },

  async claimDelivery(trackingCode: string, customerId: string): Promise<boolean> {
    const { data: delivery } = await supabase
      .from('deliveries')
      .select('id')
      .eq('tracking_code', trackingCode)
      .single();

    if (!delivery) return false;

    const { error } = await supabase
      .from('deliveries')
      .update({ customer_id: customerId })
      .eq('tracking_code', trackingCode);

    if (error) {
      console.error('Error claiming delivery:', error);
      return false;
    }
    return true;
  },

  async updateLocation(code: string, lat: number, lng: number) {
    const { error } = await supabase
      .from('deliveries')
      .update({ current_lat: lat, current_lng: lng })
      .eq('tracking_code', code);

    if (error) {
      console.error('Error updating location:', error);
    }
  },

  async updateStatus(code: string, status: string, statusText: string, location: string) {
    // Get the delivery ID first
    const { data: delivery } = await supabase
      .from('deliveries')
      .select('id')
      .eq('tracking_code', code)
      .single();

    if (!delivery) return;

    // Update status
    const { error: updateError } = await supabase
      .from('deliveries')
      .update({ 
        status: status as any, 
        status_text: statusText, 
        current_city: location,
        progress: status === 'delivered' ? 100 : (status === 'out-for-delivery' ? 90 : undefined)
      })
      .eq('tracking_code', code);

    if (updateError) {
      console.error('Error updating status:', updateError);
      return;
    }

    // Add timeline event
    const { error: timelineError } = await supabase
      .from('timeline_events')
      .insert({
        delivery_id: delivery.id,
        event_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        event_date: 'Today',
        title: statusText,
        location: location,
        status: 'completed'
      });

    if (timelineError) {
      console.error('Error adding timeline event:', timelineError);
    }
  },

  subscribeToDelivery(code: string, callback: (payload: any) => void) {
    return supabase
      .channel(`delivery-${code}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deliveries',
          filter: `tracking_code=eq.${code}`
        },
        callback
      )
      .subscribe();
  },

  subscribeToAllDeliveries(callback: (payload: any) => void) {
    return supabase
      .channel('all-deliveries')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deliveries'
        },
        callback
      )
      .subscribe();
  }
};
