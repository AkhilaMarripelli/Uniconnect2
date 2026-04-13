const BASE = "http://localhost:5000/api/grievance";

function getAuthHeaders() {
    return { "Content-Type": "application/json" };
}

export async function submitComplaint({ title, complaintText }) {
    const res = await fetch(`${BASE}/`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ title, complaintText }),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw errorData;
    }
    return res.json();
}

export async function fetchMyComplaints() {
    const res = await fetch(`${BASE}/mine`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch complaints");
    return res.json();
}
