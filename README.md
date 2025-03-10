# TMS

## About

TMS is a project management tool (similar to Jira) for software development teams to plan sprints and manage tasks.

The application consists of 3 main pages:

- An **applications page** which displays all applications
- A **kanban board** for each application showing the tasks in different states
- A **task page** for each task where users can interact with the task

## Role-based access control

There are 5 permissions for each application: **Create**, **Open**, **To-do**, **Doing**, **Done**.

Each permission is granted to one user group, giving all users in that user group permission to perform a set of actions when a task is at that state.

| **Permission** | **Actions**                                                         |
| -------------- | ------------------------------------------------------------------- |
| Create         | Create task                                                         |
| Open           | Release task                                                        |
| To-do          | Work on task                                                        |
| Doing          | Return task to to-do, Seek approval, Request for deadline extension |
| Done           | Approve task, Reject task                                           |

## Microservices + Containerisation

Some key functions of the application were transformed into microservices using REST APIs. These microservices were then containerised using Docker to simulate the deployment process from development to production.
