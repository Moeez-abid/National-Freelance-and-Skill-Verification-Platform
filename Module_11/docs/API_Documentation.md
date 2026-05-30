# API Documentation — Module 11 Freelancer Engagement & Gamification

## Base URL

```
http://localhost:5000
```

All API routes are prefixed with `/api`. Responses are JSON unless noted otherwise.

---

## Authentication

All endpoints require a `user-id` header for stub authentication. Replace this with the JWT token from Module 1 in production.

```
user-id: u001
```

---

## Health Check

### GET /health

Returns server status and current mode.

**Request**

No parameters required.

**Response — 200 OK**

```json
{
  "status": "ok",
  "mode": "DUMMY DB",
  "timestamp": "2026-05-07T10:00:00.000Z"
}
```

---

## WBS 3.1 — Leaderboard Endpoints

### GET /api/leaderboard

Returns the ranked leaderboard. Supports both all-time and weekly periods.

**Query Parameters**

| Parameter | Type   | Required | Description                              |
| --------- | ------ | -------- | ---------------------------------------- |
| period    | string | Yes      | `all` for all-time, `weekly` for current week |
| limit     | number | No       | Number of entries to return. Default is all entries. |

**Example Requests**

```
GET http://localhost:5000/api/leaderboard?period=all
GET http://localhost:5000/api/leaderboard?period=weekly
GET http://localhost:5000/api/leaderboard?period=all&limit=3
```

**Response — 200 OK**

```json
{
  "period": "all",
  "generated_at": "2026-05-07T10:00:00.000Z",
  "total_entries": 5,
  "leaderboard": [
    {
      "rank": 1,
      "user_id": "u001",
      "username": "zainab_dev",
      "total_points": 2400,
      "activity_count": 48,
      "level": 5,
      "badges": ["Top Performer", "Challenge Master"]
    },
    {
      "rank": 2,
      "user_id": "u002",
      "username": "manahil_pm",
      "total_points": 2400,
      "activity_count": 42,
      "level": 5,
      "badges": ["Challenge Master"]
    }
  ]
}
```

**Ranking Algorithm**

Entries are sorted by the following priority:

1. `total_points` descending
2. `activity_count` descending (tiebreaker)
3. `created_at` ascending (final tiebreaker — older account wins)

**Response — 400 Bad Request** (invalid period)

```json
{
  "error": "Invalid period. Use 'all' or 'weekly'."
}
```

---

### GET /api/leaderboard/user/:userId

Returns the rank and stats for a single user.

**Path Parameters**

| Parameter | Type   | Required | Description       |
| --------- | ------ | -------- | ----------------- |
| userId    | string | Yes      | The user's ID     |

**Query Parameters**

| Parameter | Type   | Required | Description                   |
| --------- | ------ | -------- | ----------------------------- |
| period    | string | Yes      | `all` or `weekly`             |

**Example Request**

```
GET http://localhost:5000/api/leaderboard/user/u001?period=all
```

**Response — 200 OK**

```json
{
  "user_id": "u001",
  "username": "zainab_dev",
  "rank": 1,
  "total_points": 2400,
  "activity_count": 48,
  "level": 5,
  "period": "all",
  "badges": ["Top Performer", "Challenge Master"]
}
```

**Response — 404 Not Found**

```json
{
  "error": "User not found in leaderboard."
}
```

---

### POST /api/leaderboard/refresh

Forces an immediate refresh of the leaderboard cache. The cache also auto-refreshes every 5 minutes via cron job (WBS 3.1.3, NFR-3).

**Request**

No body required.

**Example Request**

```
POST http://localhost:5000/api/leaderboard/refresh
```

**Response — 200 OK**

```json
{
  "message": "Leaderboard cache refreshed successfully.",
  "refreshed_at": "2026-05-07T10:05:00.000Z"
}
```

---

## WBS 3.2 — Trust Score Endpoints

### GET /api/user/:userId/trust-score

Returns the current trust score and level for a user. Consumed by Module 1 for profile display (REQ-34).

**Path Parameters**

| Parameter | Type   | Required | Description   |
| --------- | ------ | -------- | ------------- |
| userId    | string | Yes      | The user's ID |

**Example Request**

```
GET http://localhost:5000/api/user/u001/trust-score
```

**Response — 200 OK**

```json
{
  "user_id": "u001",
  "username": "zainab_dev",
  "trust_score": 95.6,
  "level": "Expert",
  "avg_rating": 4.8,
  "completion_rate": 0.95,
  "last_updated": "2026-05-07T09:00:00.000Z"
}
```

**Trust Score Levels**

| Score Range | Level      |
| ----------- | ---------- |
| 80 - 100    | Expert     |
| 60 - 79     | Advanced   |
| 40 - 59     | Intermediate |
| 20 - 39     | Beginner   |
| 0 - 19      | New        |

**Trust Score Formula**

```
TrustScore = (AvgRating x 20 x 0.6) + (CompletionRate x 100 x 0.4)
```

Score is clamped to the range 0-100.

**Response — 404 Not Found**

```json
{
  "error": "User not found."
}
```

---

### GET /api/user/:userId/trust-score/history

Returns the trust score history for a user (WBS 3.2.3).

**Path Parameters**

| Parameter | Type   | Required | Description   |
| --------- | ------ | -------- | ------------- |
| userId    | string | Yes      | The user's ID |

**Example Request**

```
GET http://localhost:5000/api/user/u001/trust-score/history
```

**Response — 200 OK**

```json
{
  "user_id": "u001",
  "history": [
    {
      "trust_score": 90.0,
      "avg_rating": 4.5,
      "completion_rate": 0.90,
      "recorded_at": "2026-04-01T08:00:00.000Z"
    },
    {
      "trust_score": 93.2,
      "avg_rating": 4.7,
      "completion_rate": 0.92,
      "recorded_at": "2026-04-15T08:00:00.000Z"
    },
    {
      "trust_score": 95.6,
      "avg_rating": 4.8,
      "completion_rate": 0.95,
      "recorded_at": "2026-05-07T09:00:00.000Z"
    }
  ]
}
```

**Response — 404 Not Found**

```json
{
  "error": "User not found."
}
```

---

### POST /api/user/:userId/trust-score/recalculate

Recalculates and updates the trust score for a user. Triggered by Module 3 on project completion or Module 1 on new rating (REQ-33).

**Path Parameters**

| Parameter | Type   | Required | Description   |
| --------- | ------ | -------- | ------------- |
| userId    | string | Yes      | The user's ID |

**Request Body**

At least one of `avg_rating` or `completion_rate` must be provided. Omitted fields retain their previous values.

```json
{
  "avg_rating": 4.8,
  "completion_rate": 0.95
}
```

| Field           | Type   | Required | Description                              |
| --------------- | ------ | -------- | ---------------------------------------- |
| avg_rating      | number | No       | Average rating from Module 1. Range: 0.0 to 5.0 |
| completion_rate | number | No       | Project completion rate from Module 3. Range: 0.0 to 1.0 |

**Example Requests**

```
POST http://localhost:5000/api/user/u001/trust-score/recalculate
Body: { "avg_rating": 4.8, "completion_rate": 0.95 }

POST http://localhost:5000/api/user/u001/trust-score/recalculate
Body: { "completion_rate": 0.95 }

POST http://localhost:5000/api/user/u001/trust-score/recalculate
Body: { "avg_rating": 4.8 }
```

**Response — 200 OK**

```json
{
  "user_id": "u001",
  "previous_score": 93.2,
  "new_score": 95.6,
  "level": "Expert",
  "avg_rating": 4.8,
  "completion_rate": 0.95,
  "updated_at": "2026-05-07T10:00:00.000Z"
}
```

**Response — 400 Bad Request** (no fields provided)

```json
{
  "error": "Provide at least one of avg_rating or completion_rate."
}
```

**Response — 422 Unprocessable Entity** (values out of range)

```json
{
  "error": "avg_rating must be between 0 and 5. completion_rate must be between 0.0 and 1.0."
}
```

**Response — 404 Not Found**

```json
{
  "error": "User not found."
}
```

---

## WBS 3.3 — Notification Endpoints

### GET /api/notifications/:userId

Returns all notifications for a user (REQ-38). Supports filtering by read status.

**Path Parameters**

| Parameter | Type   | Required | Description   |
| --------- | ------ | -------- | ------------- |
| userId    | string | Yes      | The user's ID |

**Query Parameters**

| Parameter   | Type    | Required | Description                                       |
| ----------- | ------- | -------- | ------------------------------------------------- |
| unread_only | boolean | No       | If `true`, returns only unread notifications. Default: `false` |

**Example Requests**

```
GET http://localhost:5000/api/notifications/u001
GET http://localhost:5000/api/notifications/u001?unread_only=true
```

**Response — 200 OK**

```json
{
  "user_id": "u001",
  "total": 3,
  "notifications": [
    {
      "id": "n001",
      "type": "badge",
      "message": "You earned the Challenge Master badge!",
      "is_read": false,
      "is_archived": false,
      "created_at": "2026-05-07T09:30:00.000Z"
    },
    {
      "id": "n002",
      "type": "points",
      "message": "You earned 150 points for completing a project.",
      "is_read": true,
      "is_archived": false,
      "created_at": "2026-05-06T14:00:00.000Z"
    },
    {
      "id": "n003",
      "type": "level",
      "message": "Congratulations! You reached Level 5.",
      "is_read": false,
      "is_archived": false,
      "created_at": "2026-05-05T11:00:00.000Z"
    }
  ]
}
```

**Notification Types**

| Type      | Description                         |
| --------- | ----------------------------------- |
| points    | User earned points from an activity |
| level     | User reached a new level            |
| badge     | User earned a badge                 |
| challenge | User completed or joined a challenge |

**Response — 404 Not Found**

```json
{
  "error": "User not found."
}
```

---

### GET /api/notifications/:userId/unread-count

Returns the count of unread notifications for a user. Used by the frontend notification panel (REQ-40).

**Path Parameters**

| Parameter | Type   | Required | Description   |
| --------- | ------ | -------- | ------------- |
| userId    | string | Yes      | The user's ID |

**Example Request**

```
GET http://localhost:5000/api/notifications/u001/unread-count
```

**Response — 200 OK**

```json
{
  "user_id": "u001",
  "unread_count": 2
}
```

**Response — 404 Not Found**

```json
{
  "error": "User not found."
}
```

---

### PUT /api/notifications/:userId/:notificationId/read

Marks a single notification as read (REQ-39).

**Path Parameters**

| Parameter      | Type   | Required | Description           |
| -------------- | ------ | -------- | --------------------- |
| userId         | string | Yes      | The user's ID         |
| notificationId | string | Yes      | The notification's ID |

**Example Request**

```
PUT http://localhost:5000/api/notifications/u001/n001/read
```

**Request Body**

No body required.

**Response — 200 OK**

```json
{
  "message": "Notification marked as read.",
  "notification_id": "n001",
  "user_id": "u001",
  "updated_at": "2026-05-07T10:10:00.000Z"
}
```

**Response — 404 Not Found** (user or notification not found)

```json
{
  "error": "Notification not found."
}
```

---

### PUT /api/notifications/:userId/read-all

Marks all notifications for a user as read.

**Path Parameters**

| Parameter | Type   | Required | Description   |
| --------- | ------ | -------- | ------------- |
| userId    | string | Yes      | The user's ID |

**Example Request**

```
PUT http://localhost:5000/api/notifications/u001/read-all
```

**Request Body**

No body required.

**Response — 200 OK**

```json
{
  "message": "All notifications marked as read.",
  "user_id": "u001",
  "updated_count": 2,
  "updated_at": "2026-05-07T10:12:00.000Z"
}
```

**Response — 404 Not Found**

```json
{
  "error": "User not found."
}
```

---

### POST /api/notifications/send

Sends a notification to a user. Used internally by services and by other modules to trigger notification events (REQ-36, REQ-37).

**Request Body**

```json
{
  "user_id": "u001",
  "type": "badge",
  "message": "You earned the Challenge Master badge!"
}
```

| Field   | Type   | Required | Description                                    |
| ------- | ------ | -------- | ---------------------------------------------- |
| user_id | string | Yes      | The recipient user's ID                        |
| type    | string | Yes      | One of: `points`, `level`, `badge`, `challenge` |
| message | string | Yes      | The notification message text                  |

**Example Request**

```
POST http://localhost:5000/api/notifications/send
Body:
{
  "user_id": "u001",
  "type": "badge",
  "message": "You earned the Challenge Master badge!"
}
```

**Response — 201 Created**

```json
{
  "message": "Notification sent successfully.",
  "notification": {
    "id": "n004",
    "user_id": "u001",
    "type": "badge",
    "message": "You earned the Challenge Master badge!",
    "is_read": false,
    "is_archived": false,
    "created_at": "2026-05-07T10:15:00.000Z"
  }
}
```

**Response — 400 Bad Request** (missing fields)

```json
{
  "error": "user_id, type, and message are required."
}
```

**Response — 400 Bad Request** (invalid type)

```json
{
  "error": "Invalid type. Must be one of: points, level, badge, challenge."
}
```

**Response — 404 Not Found**

```json
{
  "error": "User not found."
}
```

---

## Error Reference

| Status Code | Meaning                                          |
| ----------- | ------------------------------------------------ |
| 200         | Request succeeded                                |
| 201         | Resource created successfully                    |
| 400         | Bad request — missing or invalid parameters      |
| 404         | Resource not found                               |
| 422         | Unprocessable entity — values fail validation    |
| 500         | Internal server error                            |

**Generic 500 Response**

```json
{
  "error": "Internal server error.",
  "detail": "Unexpected failure in leaderboardService."
}
```

---

## Dummy Data Reference

The following user IDs and notification IDs are available in dummy DB mode (`USE_DUMMY_DB=true`):

**User IDs:** `u001`, `u002`, `u003`, `u004`, `u005`

**Notification IDs:** `n001`, `n002`, `n003`, `n004`, `n005`

---

## Inter-Module API Usage

### Module 1 — Fetch trust score for profile display

```
GET /api/user/{freelancer_id}/trust-score
```

Returns `trust_score`, `level`, and `avg_rating` for display on the freelancer profile page.

### Module 1 — Trigger recalculate after new rating posted

```
POST /api/user/{freelancer_id}/trust-score/recalculate
Body: { "avg_rating": 4.8 }
```

### Module 3 — Trigger recalculate after project completed

```
POST /api/user/{freelancer_id}/trust-score/recalculate
Body: { "completion_rate": 0.95 }
```

### Frontend WBS 4.5 — Notification panel

```
GET /api/notifications/{user_id}
GET /api/notifications/{user_id}/unread-count
PUT /api/notifications/{user_id}/read-all
```

### Any module — Send a notification event

```
POST /api/notifications/send
Body: { "user_id": "u001", "type": "points", "message": "You earned 200 points!" }
```

---

## SRS Requirements Covered

| Requirement | Endpoint / Logic                                      |
| ----------- | ----------------------------------------------------- |
| REQ-22      | Rank by total points — `leaderboardService.applyRankingAlgorithm()` |
| REQ-23      | Activity tiebreaker — sort step 2 in algorithm        |
| REQ-24      | Weekly leaderboard — `GET /api/leaderboard?period=weekly` |
| REQ-25      | All-time leaderboard — `GET /api/leaderboard?period=all` |
| REQ-26      | Dynamic update — 5-min cron + `POST /api/leaderboard/refresh` |
| REQ-33      | Score update on trigger — `POST /trust-score/recalculate` |
| REQ-34      | Display trust score — `GET /trust-score`              |
| REQ-35      | Score range 0-100 — clamp in `calculateTrustScore()`  |
| REQ-36      | Notify on key events — `notificationService.enqueueNotification()` |
| REQ-37      | Store notifications — `persistNotification()`         |
| REQ-38      | Display notifications — `GET /api/notifications/:userId` |
| REQ-39      | Mark as read — `PUT /api/notifications/:userId/:id/read` |
| REQ-40      | Unread count — `GET /api/notifications/:userId/unread-count` |
| NFR-3       | Leaderboard under 3s — in-memory cache (WBS 3.1.3)   |
| NFR-4       | Notification under 1s — async queue dispatcher        |
