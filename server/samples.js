// Fictional companies and roles. Dates are relative to the day samples are added.
export function sampleApplications() {
  const day = (offset) => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + offset);
    return d.toISOString().slice(0, 10);
  };
  return [
    {
      company: "Northstar Studio",
      role: "Junior Frontend Developer",
      location: "Munich · Hybrid",
      salary: "Salary to discuss",
      status: "Interview",
      applied_date: day(-9),
      follow_up_date: day(2),
      interview_at: `${day(3)}T09:00:00Z`,
      next_action: "Prepare a walkthrough of my portfolio",
      contact_name: "Alex · Recruiting",
      notes:
        "Fictional example. I like their focus on clear, accessible interfaces.",
    },
    {
      company: "Fieldwork",
      role: "Working Student · GIS & Data",
      location: "Augsburg · On-site",
      status: "Applied",
      applied_date: day(-7),
      follow_up_date: day(-1),
      next_action: "Send a short follow-up email",
      notes:
        "Fictional example. Ask about the balance of GIS analysis and field work.",
    },
    {
      company: "Good Things",
      role: "React Developer Intern",
      location: "Remote",
      status: "Saved",
      follow_up_date: day(4),
      next_action: "Tailor my CV and submit the application",
    },
    {
      company: "Common Ground",
      role: "Student Research Assistant",
      location: "Munich · Hybrid",
      status: "Applied",
      applied_date: day(-3),
      follow_up_date: day(5),
      next_action: "Review the research group’s current projects",
    },
    {
      company: "Morrow Labs",
      role: "Junior Web Developer",
      location: "Berlin · Remote",
      status: "Offer",
      applied_date: day(-21),
      follow_up_date: day(6),
      next_action: "Write down questions about the offer",
    },
    {
      company: "Little Atlas",
      role: "Mapping Intern",
      location: "Hamburg · On-site",
      status: "Closed",
      applied_date: day(-25),
      notes:
        "Fictional example. Position filled. Keep the portfolio feedback for the next application.",
    },
  ];
}
