import { defineApp } from "convex/server";
import { saveProject, getProjects, getProjectById, deleteProject } from "./http";

const convex = defineApp();

convex.addApiRoute("/projects/save", saveProject, "POST");
convex.addApiRoute("/projects/list", getProjects, "GET");
convex.addApiRoute("/projects/get", getProjectById, "GET");
convex.addApiRoute("/projects/delete", deleteProject, "POST");

export default convex;
