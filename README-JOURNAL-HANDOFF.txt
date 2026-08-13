Interview activity journal handoff update

Replace the current interview activity files with this package.

The final journal button now transfers:
- The observation investigated
- The climate-data finding
- The comparison result (mostly supports / mixed / not enough evidence)

The transfer uses the URL fragment, which is not sent to GitHub's server. The receiving
journal removes the transfer fragment immediately after importing it.

IMPORTANT: The Garden Journal must also receive the paired app.js update in the
garden-journal-handoff-receiver package.


Messaging update:
- Focus page explains before typing that responses will transfer at the end.
- Check page reminds learners that the evidence response will transfer.
- Final page explicitly says the transfer occurs when the learner clicks the save-to-journal button.
