[HOME](Home) > [TECHNICAL DOCUMENTATION](technical-documentation) > **DEVELOPMENT OVERVIEW**

Our goal is to create brilliant software and we setup an end-to-end software development life-cycle (SDLC) aiming at that. Therefore, we have created the following manual that describes
the life-cycle we have here at joo.la labs. This is an internal process and describe steps that are relevant not only to the joola framework development, but also to commercial implementations.
On top of the process described we have our community contributions that act as a key part of the software development path. 
We believe that sharing information about our internal processes with the community will not only make our process better, but also allow the community to benefit from it.

- [Testing](code-testing)
- [Code Style](code-style-guidelines)
- [Versioning](versioning)
- [Release and publish](software-release-process)
- [[Contributing]]
- [Roadmap](product-roadmap)

## Assess Needs
The first step in the process is to assess the needs of this iteration. What tasks, defects, milestones, etc... we have to cover during the iteration. 
This process is key to the success of the iteration, getting a full understanding of a requirement ensures a proper execution during the iteration with a very clear set of expectations. 
The format of this step is an *Assessment Meeting* which includes all stake-holders relevant to the iteration. 
This step can take a few hours/days and the group decides on what is included in the iteration and what's not.

## Design Specifications
Once we have the needs clarified we can design the specifications for each of the new features, bug fix, etc... Specifications must be detailed and try to evaluate the entire scope of the task. 
When designing the specifications we must take into account that a task estimated to take longer than the iteration cannot be accepted, it will need to be broken down. 
Once we have the specifications for each task, the matching estimations and all required work, we can then approve the final list of issues to be covered in the iteration.

## Design/Develop/Test
The actual code work begins, we design, develop and [test](code-testing) our work on a regular basis. 
Git development process follows [Vincent Driessen's](http://twitter.com/nvie) suggested [GitFlow](http://nvie.com/posts/a-successful-git-branching-model/) and is managed under GitHub. 
Code work should be carried out on branches and merged into the *develop* branch via managed pull-requests. When appropriate, a [release process](software-release-process) starts which merges *develop* into *master* via a *release branch*.  

Code work must adhere to the [Coding Guidelines](coding-style-guidelines).

## Implement Systems
Once the release is ready, according to the Release Management protocol, we can move on to implementation. 
We have multiple environments for ourselves and managed customers. The [Deployment](software-deployment) process must be followed by the Release Manager.

## Support Operations
Following the release process we can move on to monitor and support. The goal of this phase is to ensure the released artifacts are performing well. 
Please refer to the [Monitoring and Alerts](monitoring-and-alerts) section for instructions on how this is managed.

## Evaluate Performance
Another key part of the iteration is the evaluation phase. During this phase we will contact customers who received custom features and confirm their satisfaction and acceptance. 
For our larger customers base (SaaS) we will send targeted surveys and use the Site's Feedback option to collect impressions.
Another part of this evaluation will be measuring the operational impact of the release, i.e. does it increase or decrease our operating costs.

## And Again...
This concludes a single iteration, this is repeated every time. The more we do it, the better we get at it.
