import { sendConfirmationMail } from "../middlewares/sendMail.js";
import {
  addNewApplicant,
  createNewJob,
  deleteJob,
  findJobById as findJobByIdModel,
  getAllJobs,
  sendAllApplicants,
  updateJob,
} from "../models/job.model.js";

export default class JobControl {

  renderLandingPage = (req, res) => {
    res.render("landing-page", { user: req.session.user });
  };

  // ✅ Get all jobs
  getJobs = (req, res) => {
    let jobs = getAllJobs();

    // 🔥 FIX: convert string → array
    jobs = jobs.map(job => {
      if (typeof job.skills_required === "string") {
        job.skills_required = job.skills_required.split(",");
      }
      return job;
    });

    res.render("list-all-jobs", { jobs, user: req.session.user });
  };

  // ✅ Add new job
  newjob = (req, res) => {

    // 🔥 FIX
    if (!Array.isArray(req.body.skills_required)) {
      req.body.skills_required = [req.body.skills_required];
    }

    req.body.skills_required = req.body.skills_required.join(",");

    createNewJob(req.body);
    res.redirect("/jobs");
  };

  // Job form render
  renderJobForm = (req, res) => {
    res.render("new-job", { user: req.session.user });
  };

  // ✅ Job details (VERY IMPORTANT FIX)
 findJobById = (req, res) => {
  const id = req.params.id;

  let jobaData = findJobByIdModel(id);

  // 🚨 HANDLE NOT FOUND
  if (!jobaData) {
    return res.send("Job not found");
  }

  // 🔥 FIX skills
  if (typeof jobaData.skills_required === "string") {
    jobaData.skills_required = jobaData.skills_required.split(",");
  }

  res.render("job-details", { data: jobaData, user: req.session.user });
};
  // New applicant
  newApplicant = async (req, res) => {
    const id = req.params.id;
    const { name, email, contact } = req.body;
    const resumePath = req.file.filename;

    addNewApplicant(id, name, email, contact, resumePath);
    await sendConfirmationMail(email);

    res.redirect("/jobs");
  };

  // Applicants list
  allApplicants = (req, res) => {
    const id = req.params.id;
    const resp = sendAllApplicants(id);

    res.render("all-applicants", {
      allApplicants: resp,
      user: req.session.user,
    });
  };

  // Update form render
  renderUpdateform = (req, res) => {
    const id = req.params.id;

    let resp = findJobByIdModel(id);

    // 🔥 FIX
    if (resp && typeof resp.skills_required === "string") {
      resp.skills_required = resp.skills_required.split(",");
    }

    res.render("update-job", { job: resp });
  };

  // ✅ Update job (ONLY ONE VERSION — FIXED)
  updateJobById = (req, res) => {
    const id = req.params.id;

    // 🔥 FIX
    if (!Array.isArray(req.body.skills_required)) {
      req.body.skills_required = [req.body.skills_required];
    }

    req.body.skills_required = req.body.skills_required.join(",");

    updateJob(id, req.body);
    res.redirect(`/job/${id}`);
  };

  // Delete job
  deleteJob = (req, res) => {
    const id = req.params.id;
    deleteJob(id);
    res.redirect("/jobs");
  };
}