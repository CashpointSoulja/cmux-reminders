# cmux Reminders: Home Screen page

The iPhone and iPad half of cmux Reminders, a Mac menu bar app that notifies you when your Claude Code, Codex and Devin tabs in [cmux](https://cmux.com) start, finish, or need you.

Add this page to your Home Screen and turn on its notifications. Your Mac then sends updates through Apple's Web Push service (iOS 16.4 or later; no App Store app). Each message is encrypted on the Mac for that one device (RFC 8291) and signed with the Mac's key (VAPID, RFC 8292). `config.js` holds that key's public half.

- `index.html`: add-to-Home-Screen steps, Turn On Notifications, the pairing code for the Mac, and recent updates
- `sw.js`: shows each notification (one per agent tab, replaced as it changes) and keeps the recent list
