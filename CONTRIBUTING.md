# How to contribute

Third-party patches are essential for keeping joola.io great and we want to
keep it as easy as possible to contribute changes that get things working in
your environment. There are a few guidelines that we need contributors to
follow so that we can have a chance of keeping on top of things.

## Getting Started

* Make sure you have a [GitHub account](https://github.com/signup/free)
* Submit a ticket for your issue (http://github.com/joola/joola.io/issues),
assuming one does not already exist.
  * Clearly describe the issue including steps to reproduce when it is a bug.
  * Make sure you select the relating components to the issue.
  * Make sure you fill in the earliest version that you know has the issue.
* Fork the repository on GitHub

## Making Changes

* Create a ticket branch (name your branch issue#nnn, according to the ticket you raised) from where you want to base your work.
  * This is usually the develop branch.
  * Only target release branches if you are certain your fix must be on that
    branch.
  * To quickly create a ticket branch based on master; `git branch
    feature/issue#nnn develop` then checkout the new branch with `git
    checkout feature/issue#nnn`. Please avoid working directly on the
    `master` branch.
* Make commits of logical units.
* Check for unnecessary whitespace with `git diff --check` before committing.
* Make sure your commit messages are in the proper format `#issuenumber message`.

````
    #123 Make the example in CONTRIBUTING imperative and concrete

    Without this patch applied the example commit message in the CONTRIBUTING
    document is not a concrete example.  This is a problem because the
    contributor is left to imagine what the commit message should look like
    based on a description rather than an example.  This patch fixes the
    problem by making the example concrete and imperative.

    The first line is a real life imperative statement with a ticket number
    from our issue tracker.  The body describes the behavior without the patch,
    why this is a problem, and how the patch fixes the problem when applied.
````

* Make sure you have added the necessary tests for your changes.
* Make sure you lint your code (run: ```make lint```).
* Run _all_ the tests to assure nothing else was accidentally broken.

## Documentation

Documentation is managed under the repo's wiki.
For changes of a trivial nature to comments and documentation, it is not
always necessary to update the wiki. For contributions affecting documentation,
please contact project admins to ensure you have been granted with an editor role.

## Submitting Changes

* Sign the [Contributor License Agreement][cla].
* Push your changes to a ticket branch in your fork of the repository.
* Submit a pull request to the repository in the joola organization.
* Update your JIRA ticket to mark that you have submitted code and are ready for it to be reviewed.
  * Include a link to the pull request in the ticket

# Additional Resources

* [Issues tracker](http://github.com/joola/joola.io/issues)
* [Contributor License Agreement][cla]
* [General GitHub documentation](http://help.github.com/)
* [GitHub pull request documentation](http://help.github.com/send-pull-requests/)
* #joola.io IRC channel on freenode.org

[cla]: https://github.com/joola/joola.io/wiki/CLA