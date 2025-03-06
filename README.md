# TMS

## About

TMS is a project management tool (similar to Jira) for software development teams to plan sprints and manage tasks.

The application consists of 3 main pages:

- An **applications page** which displays all applications
- A **kanban board** for each application showing the tasks in different states
- A **task page** for each task where users can interact with the task

## Role-based access control

There are 3 roles in this system: **project lead (PL)**, **project manager (PM)** and **developer (Dev)**.

There are 5 permissions for each application: **Create**, **Open**, **To-do**, **Doing**, **Done**.

Each permission is given to one of the roles, which allows them to manage tasks at different states:

| **Permission** | **Role** | **Privileges**                                                      |
| -------------- | -------- | ------------------------------------------------------------------- |
| Create         | PL       | Create task                                                         |
| Open           | PM       | Release task                                                        |
| To-do          | Dev      | Work on task                                                        |
| Doing          | Dev      | Return task to to-do, Seek approval, Request for deadline extension |
| Done           | PL       | Approve task, Reject task                                           |

## Microservices + Docker

Some key functions of the application were transformed into microservices for independent scaling and maintenance. These microservices were then containerised using Docker to simulate environment consistency from development to production.
