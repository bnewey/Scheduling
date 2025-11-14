// components/Mobile/MobileCrewJobs.js
import React, { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Collapse,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  makeStyles,
} from "@material-ui/core";
import Crew from "../../js/Crew";
import Tasks from "../../js/Tasks";
import WorkOrders from "../../js/Work_Orders";
import cogoToast from "cogo-toast";

const MobileCrewJobs = ({ user }) => {
  const classes = useStyles();

  const [crewMembers, setCrewMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [jobs, setJobs] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0); // -1 last, 0 this, 1 next, 2 two weeks out
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const [expandedJobId, setExpandedJobId] = useState(null);
  const [confirmJob, setConfirmJob] = useState(null);
  const [callbackJob, setCallbackJob] = useState(null);
  const [callbackReason, setCallbackReason] = useState("");
  const [savingCallback, setSavingCallback] = useState(false);

  // load crew members
  useEffect(() => {
    let isMounted = true;
    Crew.getCrewMembers()
      .then((data) => {
        if (!isMounted) return;
        setCrewMembers(data || []);
        setLoadingMembers(false);
      })
      .catch((err) => {
        console.error(err);
        cogoToast.error("Error loading crew members");
        if (isMounted) setLoadingMembers(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // load jobs for selected member (store only uncompleted; week filter applied below)
  useEffect(() => {
    if (!selectedMemberId) {
      setJobs([]);
      return;
    }
    setLoadingJobs(true);
    Crew.getCrewJobsByMember(selectedMemberId)
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const uncompleted = list.filter(
          (job) =>
            job.completed === 0 ||
            job.completed === "0" ||
            job.completed == null
        );
        setJobs(uncompleted);
        setLoadingJobs(false);
        setExpandedJobId(null);
      })
      .catch((err) => {
        console.error(err);
        cogoToast.error("Error loading jobs for member");
        setLoadingJobs(false);
      });
  }, [selectedMemberId]);

  // Week helpers: compute start/end of selected week (Sunday→Saturday), and parse job date
  const getWeekRange = (offset = 0) => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const day = start.getDay(); // 0=Sun
    start.setDate(start.getDate() - day + 7 * offset);
    const end = new Date(start);
    end.setDate(start.getDate() + 7); // exclusive
    return { start, end };
  };

  const getJobDate = (job) => {
    const dateStr =
      job.job_type === "install" ? job.sch_install_date : job.drill_date;
    if (!dateStr) return null;
    // Be tolerant of "YYYY-MM-DD HH:MM:SS" or "YYYY-MM-DD"
    const isoish = dateStr.split(" ")[0];
    const d = new Date(isoish);
    if (isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // derive the jobs to display for the chosen week window
  const { start: weekStart, end: weekEnd } = getWeekRange(weekOffset);
  const displayJobs = jobs.filter((job) => {
    const jd = getJobDate(job);
    return jd && jd >= weekStart && jd < weekEnd;
  });

  const handleCompleteJob = async () => {
    if (!confirmJob) return;
    try {
      const ok = await Crew.updateCrewJobCompleted(
        1,
        confirmJob.id,
        confirmJob.crew_id,
        user
      );
      if (ok) {
        cogoToast.success("Job completed");
        // remove from base list; derived list will follow
        setJobs((prev) => prev.filter((j) => j.id !== confirmJob.id));
      } else {
        cogoToast.error("Failed to complete job");
      }
    } catch (err) {
      console.error(err);
      cogoToast.error("Failed to complete job");
    } finally {
      setConfirmJob(null);
    }
  };

  const handleSaveCallback = async () => {
    if (!callbackJob) return;
    const reason = callbackReason.trim();
    if (!reason) {
      cogoToast.warn("Please enter a reason for the callback.");
      return;
    }

    setSavingCallback(true);
    try {
      const taskResp = await Tasks.getTask(callbackJob.task_id);
      const task = Array.isArray(taskResp) ? taskResp[0] : taskResp;
      if (!task) throw new Error("No task found for this job.");

      const workOrderId = task.table_id;
      const existingNotes = task.notes || "";
      const newNotes =
        (existingNotes ? existingNotes + "\n" : "") +
        `CALLBACK REASON: ${reason}`;

      await WorkOrders.updateWONotes(workOrderId, newNotes, user);
      cogoToast.success("Callback added to work order.");
    } catch (err) {
      console.error(err);
      cogoToast.error("Failed to save callback.");
    } finally {
      setSavingCallback(false);
      setCallbackJob(null);
      setCallbackReason("");
    }
  };

  return (
    <Box className={classes.root}>
      <Typography variant="h6" className={classes.header}>
        Field Crew Jobs
      </Typography>

      {/* crew member selector */}
      <FormControl variant="outlined" fullWidth>
        <InputLabel id="mobile-crew-select-label">Crew Member</InputLabel>
        <Select
          labelId="mobile-crew-select-label"
          label="Crew Member"
          value={selectedMemberId}
          onChange={(e) => setSelectedMemberId(e.target.value)}
          disabled={loadingMembers}
        >
          {loadingMembers ? (
            <MenuItem value="">
              <em>Loading...</em>
            </MenuItem>
          ) : crewMembers.length ? (
            crewMembers.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.member_name || `Member ${m.id}`}
              </MenuItem>
            ))
          ) : (
            <MenuItem value="">
              <em>No crew members</em>
            </MenuItem>
          )}
        </Select>
      </FormControl>

      {/* week filter */}
      <Box mt={1.5}>
        <FormControl variant="outlined" fullWidth>
          <InputLabel id="mobile-week-select-label">Week</InputLabel>
          <Select
            labelId="mobile-week-select-label"
            label="Week"
            value={weekOffset}
            onChange={(e) => setWeekOffset(Number(e.target.value))}
          >
            <MenuItem value={-1}>Last week</MenuItem>
            <MenuItem value={0}>This week</MenuItem>
            <MenuItem value={1}>Next week</MenuItem>
            <MenuItem value={2}>Two weeks</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* jobs list */}
      <Box className={classes.jobList}>
        {loadingJobs ? (
          <Box display="flex" justifyContent="center" mt={2}>
            <CircularProgress size={26} />
          </Box>
        ) : selectedMemberId ? (
          displayJobs && displayJobs.length ? (
            <>
              <Typography variant="subtitle1" style={{ marginTop: "0.5rem" }}>
                Jobs for selected member
              </Typography>
              {displayJobs.map((job) => {
                const isExpanded = expandedJobId === job.id;
                return (
                  <div key={job.id} className={classes.jobRow}>
                    <div
                      className={classes.jobTop}
                      onClick={() =>
                        setExpandedJobId(isExpanded ? null : job.id)
                      }
                    >
                      <div className={classes.jobTitle}>
                        {job.t_name ||
                          job.job_name ||
                          job.task_name ||
                          `Job ${job.id}`}
                      </div>
                    </div>
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <div className={classes.jobExpanded}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => setConfirmJob(job)}
                        >
                          Complete Job
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setCallbackJob(job);
                            setCallbackReason("");
                          }}
                        >
                          Note for Callback
                        </Button>
                      </div>
                    </Collapse>
                  </div>
                );
              })}
            </>
          ) : (
            <Typography variant="body2" style={{ marginTop: "1rem" }}>
              No jobs for the selected week.
            </Typography>
          )
        ) : (
          <Typography variant="body2" style={{ marginTop: "1rem" }}>
            Select a crew member to see their jobs.
          </Typography>
        )}
      </Box>

      {/* Complete dialog */}
      <Dialog
        open={!!confirmJob}
        onClose={() => setConfirmJob(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Complete the Job?</DialogTitle>
        <DialogContent>
          {confirmJob ? (
            <Typography variant="body2">
              {confirmJob.t_name || `Job ${confirmJob.id}`} will be marked as
              completed.
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmJob(null)} color="default">
            No
          </Button>
          <Button
            onClick={handleCompleteJob}
            color="primary"
            variant="contained"
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Callback dialog */}
      <Dialog
        open={!!callbackJob}
        onClose={() => setCallbackJob(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Reason for Callback?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            This will be added to the work order notes.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Reason"
            type="text"
            fullWidth
            value={callbackReason}
            onChange={(e) => setCallbackReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCallbackJob(null)} color="default">
            Close
          </Button>
          <Button
            onClick={handleSaveCallback}
            color="primary"
            variant="contained"
            disabled={savingCallback}
          >
            {savingCallback ? "Saving..." : "OK"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MobileCrewJobs;

const useStyles = makeStyles(() => ({
  root: {
    padding: "0.5rem 0.5rem 4rem",
    background: "#f3f3f3",
    minHeight: "100vh",
  },
  header: {
    fontWeight: 600,
    marginBottom: "0.75rem",
  },
  jobList: {
    marginTop: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  jobRow: {
    background: "#f2dab8",
    border: "1px solid #d2b88f",
    borderRadius: 6,
    display: "flex",
    flexDirection: "column",
  },
  jobTop: {
    display: "flex",
    alignItems: "center",
    padding: "0.55rem 0.6rem",
    cursor: "pointer",
  },
  jobTitle: {
    fontWeight: 600,
    fontSize: "0.9rem",
    flex: 1,
  },
  jobDate: {
    fontSize: "0.75rem",
    color: "#2b5b7c",
    fontWeight: 500,
    marginLeft: 8,
  },
  jobExpanded: {
    borderTop: "1px solid rgba(0,0,0,0.1)",
    padding: "0.5rem 0.6rem 0.6rem",
    display: "flex",
    gap: "0.5rem",
  },
}));