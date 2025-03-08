#!/bin/bash

# Get token from TOKEN file
TOKEN=$(cat TOKEN)

# Run the burndown chart workflow
echo "Testing burndown chart workflow..."
act workflow_dispatch -W workflows/burndown_chart.yml --secret GITHUB_TOKEN=$TOKEN

# Run the velocity chart workflow
echo "Testing velocity chart workflow..."
act workflow_dispatch -W workflows/velocity_chart.yml --secret GITHUB_TOKEN=$TOKEN

# Test milestone event
echo "Testing milestone closing event..."
echo '{
  "action": "closed",
  "milestone": {
    "title": "Sprint 1",
    "due_on": "2025-03-01T00:00:00Z"
  }
}' > milestone_event.json

act milestone -e milestone_event.json -W workflows/velocity_chart.yml --secret GITHUB_TOKEN=$TOKEN