As a framework, joola.io addresses many runtime issues, some are common and shared between the different framework sub-systems.
For example, several systems need to access mongo, so we have a common module to deal with mongo connections and actions.

All of these `common` modules can be found under `lib/common` with `index.js` acting as the main common library which can be accessed via <code><a href="lib\common\index (jsdoc)">joola.common</a></code>.

Below is a complete list of `common` modules:
[##INSERTSTRUCTURE_COMMON##]