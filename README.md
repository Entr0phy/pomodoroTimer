# pomodoroTimer
Backend API service for a pomodoro timer

## Set up instructions
- As the databse used is postgres, ensure postgres is installed on the local computer
- Create a new database called pomodoro on postgres itself
- npm i to install all dependency required
- the env example is provided as a reference, adjust accordingly based off the credentials on your own postgres on your localhost

## API design choices
- So the API has 3 controllers namely users for all users related API, configuration for all configuration of the user and session that deals with the api for all the session of a user
- The user APi simply deals with CRUD of a user and creating user also creates a default configuration in the configuration table, i have added a layer of protection to rollback transactions should there be any failure in commiting a transaction in between the creation of a field in any of the 2 tables of user and configuration
- configuration API only has a end point for user to change the configuration of their timer namely work duration, short and long break duration and the interval before each long break
- The session controller deals with everything relating to a session. So it has a start new session which creates a new session based off the configuration a user has set.
- The pause API pause the timer and also update the remaining time, this is to be used for getting current status and also changes the state to paused
- The resume API resumes the timer and also updates the start time to the current time
- The end session API ends the current session and then automatically starts a new session type depending on the current session that is ended. The mod operator is used to determine if its a long or short break next
- The getCurrentStatus gets the current time through the following, first it checks if it status is paused; if its paused, it simply returns the current time as when a user paused the session, an updated remaining time is already calculated and stored, if its not, we simply do a subtraction by getting the current time minusing the start_time to get the elapsed time. As each time a user resumes a session, the start time is re set to the time they resume this will ensure that the pause and resume do not mess up the actual time that is worked on. Finally, the elapsed time will be subtracted from the time_left displaying the accurate time left in seconds

## Database Schema

![image](https://github.com/Entr0phy/pomodoroTimer/assets/77575454/b3f2d80a-b3ff-4666-996e-88c0ed4ba239)
