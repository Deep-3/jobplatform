// index.js
const Sequelize = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user')(sequelize, Sequelize.DataTypes);
const JobSeekerProfile = require('./jobseekerprofile')(sequelize, Sequelize.DataTypes);
const EmployerProfile = require('./employerprofile')(sequelize, Sequelize.DataTypes);
const Company = require('./company')(sequelize, Sequelize.DataTypes);
const Job = require('./job')(sequelize, Sequelize.DataTypes);
const JobApplication = require('./jobApplication')(sequelize, Sequelize.DataTypes);
const Notification=require('./notification')(sequelize,Sequelize.DataTypes);
const Community=require('./community')(sequelize,Sequelize.DataTypes);


const db = {
  User,
  JobSeekerProfile,
  EmployerProfile,
  Company,
  JobApplication,
  Job,
  Notification,
  Community,
  sequelize,
  Sequelize,
};

// Define relationships
User.hasOne(JobSeekerProfile, {
  foreignKey: 'userId',
  as: 'jobSeekerProfile',
  onDelete: 'CASCADE',
});

JobSeekerProfile.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasOne(EmployerProfile, {
  foreignKey: 'userId',
  as: 'employerProfile',
  onDelete: 'CASCADE',
});

EmployerProfile.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});


Company.hasOne(EmployerProfile, {
  foreignKey: 'companyId',
  as: 'employee',
  onDelete:'SET NULL'
});

EmployerProfile.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'company'
});

Company.hasMany(Job,{
  foreignKey:'companyId',
  as:'jobs',
  onDelete:'CASCADE',
})

Job.belongsTo(Company,{
  foreignKey:'companyId',
  as:'company',
  onDelete:'CASCADE',
  });

Job.hasMany(JobApplication, {
    foreignKey: 'jobId',
    as: 'applications',
    onDelete:'CASCADE',
  });

  JobApplication.belongsTo(Job, {
    foreignKey: 'jobId',
    as: 'job'
  });

  JobSeekerProfile.hasMany(JobApplication,{
    foreignKey:' jobSeekerId',
    as:'jobApply',
    onDelete:'CASCADE',
  })
  
  JobApplication.belongsTo(JobSeekerProfile, {
    foreignKey: 'jobSeekerId',
    as: 'jobSeeker'
  });

 
// HRProfile.belongsTo(User, {
//   foreignKey: 'userId',
//   as: 'user',
// });

module.exports = db;