const db = require('../models');
const jwt=require('jsonwebtoken')
const { interviewMail} = require('../utils/pdfgenerate');
const { sendMail} = require('../utils/sendmail');


exports.scheduleInterview = async (req, res) => {
    try {
      const {
        jobApplicationId,
        scheduledDate,
        startTime,
        endTime,
        meetingUrl
      } = req.body;
  
      // 1. Get job application details
      const jobApplication = await db.JobApplication.findByPk(jobApplicationId, {
      });
  
      if (!jobApplication) {
        return res.status(404).json({
          success: false,
          message: "Job application not found"
        });
      }

      const findinterview=await db.InterviewSchedule.findOne({
        where:{
          jobApplicationId
        }
      })
      if(findinterview)
      {
        return res.status(404).json({
          success: false,
          message: "interview alredy scheduled"
        });
      }

      
  
      // 3. Create interview record
      const interview = await db.InterviewSchedule.create({
        jobApplicationId,
        scheduledDate,
        startTime,
        endTime,
        meetingUrl,
        meetingStatus: 'scheduled'
      });
  
      // 4. Update job application status
      await jobApplication.update({
        status: 'Interview_schedule'
      });

      const Application = await db.JobApplication.findByPk(jobApplicationId, {
        include:[{
         model: db.User,
         as: 'user',
         attributes: ['name', 'email'],
        },
        {
         model: db.Job,
         as: 'job',
         attributes: ['title'],
         include:{
          model:db.Company,
          as:'company'
         }
        },
        {
         model:db.InterviewSchedule,
         as:'interviewschedule'
        }
       ]
       });


       const interviewApplications={
        name:Application.user.name,
        jobtitle:Application.job.title,
        scheduledDate,
        startTime,
        endTime,
        meetingUrl,
        companyname:Application.job.company.companyName,
        companylogo:Application.job.company.companyLogo
       }
  
         const html = await interviewMail(interviewApplications, 'interview.hbs');
         const emailResult=await sendMail(Application.user.email,`Interview Scheduled - ${interviewApplications.jobtitle}`,html);
     
  
    return res.status(201).json({
        success: true,
        data: {
        // interview,
        Application
        }
      });
  
    } catch (error) {
      console.error('Interview Scheduling Error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };
  
  // Get interview details with meeting info
  exports.getInterviewDetails = async (req, res) => {
    try {
      const { id } = req.params;
  
      const interview = await db.InterviewSchedule.findByPk(id, {
        include: [{
          model: db.JobApplication,
          as:'jobApplication',
          include: [{
            model: db.User,
            as: 'user',
            attributes: ['name', 'email']
          }, {
            model: db.Job,
            as: 'job',
            attributes: ['title']
          }]
        }]
      });
  
      if (!interview) {
        return res.status(404).json({
          success: false,
          error: "Interview not found"
        });
      }
  
      // Generate fresh token for video meeting
      const token = generateVideoToken();
  
      return res.json({
        success: true,
        data: {
          interview,
          meeting: {
            meetingId: interview.meetingId,
            token
          }
        }
      });
  
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };
  

  exports.getVideoToken = async (req, res) => {
    try {
      const token = generateVideoToken();
      return res.json({ token });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };
  
  const generateVideoToken = () => {
    const API_KEY ="f943becd-47fd-458f-a430-f9ac43e8acac";
    const SECRET_KEY = "ead9c661a2b11616f6524fec931e7480bccebc47b59a2d13995e43b10508a050";
  
    const payload = {
      apikey: API_KEY,
      permissions: ["allow_join", "allow_mod"],
      version: 2,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60
    };
  
    return jwt.sign(payload, SECRET_KEY);
  };
  
  