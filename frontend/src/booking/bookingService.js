const API_URL = 'http://localhost:5000/api/booking';

export const getResources = async () => {
    const res = await fetch(`${API_URL}/resources`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
};

export const requestBooking = async (data) => {
    const res = await fetch(`${API_URL}/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
    });
    if (!res.ok) {
        const errData = await res.json();
        // Conflict (409) or other errors
        throw { 
            response: { 
                data: { 
                    message: errData.message || 'Booking failed' 
                } 
            } 
        };
    }
    return res.json();
};

export const getMyRequests = async () => {
    const res = await fetch(`${API_URL}/my-requests`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    return res.json();
};

export const getAdminRequests = async () => {
    const res = await fetch(`${API_URL}/admin/requests`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    return res.json();
};

export const decideRequest = async (id, status, adminMessage) => {
    const res = await fetch(`${API_URL}/admin/decide/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminMessage }),
        credentials: 'include'
    });
    return res.json();
};

export const getPeakPrediction = async (resourceId) => {
    const res = await fetch(`${API_URL}/heatmap/${resourceId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
};

export const getOccupiedSlots = async (resourceId) => {
    const res = await fetch(`${API_URL}/occupied/${resourceId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
};
