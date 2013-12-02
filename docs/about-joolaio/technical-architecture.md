joola.io's **Events Sub-system** has a non-traditional design to support both local and distributed communication.

The sub-system is divided into two parts:
* ``joola.dispatch`` provide distributed redis-based pub/sub events shared between all nodes.
* ``joola.events`` provide a local events system based on emit/on that most of us are familiar with.

