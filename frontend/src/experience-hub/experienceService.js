export const createExperience = async (data) => {
  const response = await fetch("http://localhost:5000/api/experience", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to submit experience");
  }

  return response.json();
};

export const fetchMyExperiences = async () => {
  const response = await fetch("http://localhost:5000/api/experience", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch experiences");
  }

  return response.json();
};

export const searchQuestions = async ({ subject, company }) => {
  const params = new URLSearchParams({ subject });

  if (company) {
    params.append("company", company);
  }

  const response = await fetch(
    `http://localhost:5000/api/experience/search?${params.toString()}`,
    { credentials: "include" }
  );

  if (!response.ok) {
    throw new Error("Search failed");
  }

  return response.json();
};

export const fetchAllExperiences = async (company = "") => {
  const url = company
    ? `http://localhost:5000/api/experience/all?company=${encodeURIComponent(company)}`
    : "http://localhost:5000/api/experience/all";

  const response = await fetch(url, { credentials: "include" });

  if (!response.ok) {
    throw new Error("Failed to fetch experiences");
  }

  return response.json();
};


