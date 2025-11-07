import { initClient } from "@ts-rest/core";
import { apiContract } from "@src/server/api/contracts/api";

// Create the client
export const api = initClient(apiContract, {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  baseHeaders: {},
});

// Helper function to create an authenticated client
export function createAuthenticatedApiClient(apiKey: string) {
  return initClient(apiContract, {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    baseHeaders: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
}

// Example usage:
/*
// Using an API key
const apiClient = createAuthenticatedApiClient('ak_your_api_key_here');

// Get user profile
const profile = await apiClient.getUserProfile();

// Get projects
const projects = await apiClient.getProjects();

// Create a project
const newProject = await apiClient.createProject({
  body: {
    name: "My New Project",
    description: "A new project",
    organizationId: "org_123",
  },
});

// Get project by ID
const project = await apiClient.getProject({
  params: { id: "project_123" },
});

// Get project products
const products = await apiClient.getProjectProducts({
  params: { id: "project_123" },
});
*/