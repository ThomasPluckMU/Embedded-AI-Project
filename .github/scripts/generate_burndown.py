#!/usr/bin/env python3
"""
Script to generate burndown charts from GitHub issues.
This script looks at the current milestone and generates a burndown chart.

Requirements:
- Issues must have a label for story points (e.g., "points:1", "points:3", etc.)
- Issues must be assigned to a milestone
"""

import os
import re
import datetime
import pathlib
from github import Github
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import pandas as pd
import numpy as np

# Configure GitHub access
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN')
REPO_NAME = os.environ.get('GITHUB_REPOSITORY')  # Format: owner/repo

# Configure story point labels
POINT_LABEL_PATTERN = r'^points:(\d+)$'

# Directories
REPORTS_DIR = pathlib.Path('reports/burndown_charts')
REPORTS_DIR.mkdir(parents=True, exist_ok=True)


def get_active_milestone():
    """Get the currently active milestone."""
    g = Github(GITHUB_TOKEN)
    repo = g.get_repo(REPO_NAME)
    
    # Find open milestones with the closest due date
    open_milestones = [m for m in repo.get_milestones(state='open') if m.due_on]
    if not open_milestones:
        print("No open milestones with due dates found")
        return None
    
    # Return the milestone with the closest due date
    return sorted(open_milestones, key=lambda m: m.due_on)[0]


def get_story_points(issue):
    """Extract story points from issue labels."""
    for label in issue.labels:
        match = re.match(POINT_LABEL_PATTERN, label.name)
        if match:
            return int(match.group(1))
    return 0  # Default if no points label


def generate_burndown_data(milestone):
    """Generate burndown chart data for the given milestone."""
    g = Github(GITHUB_TOKEN)
    repo = g.get_repo(REPO_NAME)
    
    # Get all issues in the milestone
    milestone_issues = repo.get_issues(milestone=milestone, state='all')
    
    # Calculate total points
    total_points = sum(get_story_points(issue) for issue in milestone_issues)
    
    # Start date is either milestone start date or date of first issue creation
    if milestone.created_at:
        start_date = milestone.created_at.date()
    else:
        issue_dates = [issue.created_at.date() for issue in milestone_issues]
        start_date = min(issue_dates) if issue_dates else datetime.date.today()
    
    # End date is milestone due date
    end_date = milestone.due_on.date()
    
    # Generate date range
    date_range = pd.date_range(start=start_date, end=end_date)
    
    # Calculate ideal burndown
    ideal_data = pd.Series(
        np.linspace(total_points, 0, len(date_range)),
        index=date_range
    )
    
    # Calculate actual burndown
    actual_data = []
    remaining_points = total_points
    
    # Get all closed issues with their closed dates
    closed_issues = [(issue, issue.closed_at.date()) 
                     for issue in milestone_issues 
                     if issue.closed_at]
    closed_issues.sort(key=lambda x: x[1])
    
    # Create a dictionary of points closed per date
    points_closed_by_date = {}
    for issue, close_date in closed_issues:
        points = get_story_points(issue)
        if close_date in points_closed_by_date:
            points_closed_by_date[close_date] += points
        else:
            points_closed_by_date[close_date] = points
    
    # Build actual burndown data
    for date in date_range:
        current_date = date.date()
        if current_date in points_closed_by_date:
            remaining_points -= points_closed_by_date[current_date]
        actual_data.append(remaining_points)
    
    actual_data = pd.Series(actual_data, index=date_range)
    
    return ideal_data, actual_data, start_date, end_date, total_points


def plot_burndown_chart(milestone, ideal_data, actual_data, start_date, end_date, total_points):
    """Create a burndown chart for the given milestone."""
    plt.figure(figsize=(12, 6))
    
    # Plot ideal burndown line
    plt.plot(ideal_data.index, ideal_data.values, 'b--', label='Ideal Burndown')
    
    # Plot actual burndown line (only up to today)
    today = datetime.date.today()
    actual_until_today = actual_data[actual_data.index.date <= today]
    plt.plot(actual_until_today.index, actual_until_today.values, 'r-', label='Actual Burndown')
    
    # Add reference line for today
    if start_date <= today <= end_date:
        plt.axvline(x=today, color='g', linestyle='-', alpha=0.3, label='Today')
    
    # Set labels and title
    plt.xlabel('Date')
    plt.ylabel('Story Points Remaining')
    plt.title(f'Burndown Chart - {milestone.title}')
    
    # Configure x-axis to show dates nicely
    plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
    plt.gca().xaxis.set_major_locator(mdates.DayLocator(interval=2))
    plt.gcf().autofmt_xdate()
    
    # Add grid and legend
    plt.grid(True, linestyle='--', alpha=0.7)
    plt.legend()
    
    # Add annotations with start and end values
    plt.annotate(f'Start: {total_points} points', 
                xy=(ideal_data.index[0], ideal_data.values[0]),
                xytext=(10, -20),
                textcoords='offset points',
                arrowprops=dict(arrowstyle='->', connectionstyle='arc3,rad=.2'))
    
    plt.annotate('Goal: 0 points', 
                xy=(ideal_data.index[-1], ideal_data.values[-1]),
                xytext=(10, 20),
                textcoords='offset points',
                arrowprops=dict(arrowstyle='->', connectionstyle='arc3,rad=.2'))
    
    # Save the chart
    filename = f"{REPORTS_DIR}/{milestone.title.replace(' ', '_')}_burndown.png"
    plt.savefig(filename, dpi=300, bbox_inches='tight')
    print(f"Burndown chart saved to {filename}")
    
    # Also save the latest chart with a fixed name for embedding
    plt.savefig(f"{REPORTS_DIR}/latest_burndown.png", dpi=300, bbox_inches='tight')
    print(f"Latest burndown chart saved to {REPORTS_DIR}/latest_burndown.png")


def main():
    """Main function to generate the burndown chart."""
    active_milestone = get_active_milestone()
    
    if not active_milestone:
        print("No active milestone found")
        return
    
    print(f"Generating burndown chart for milestone: {active_milestone.title}")
    
    ideal_data, actual_data, start_date, end_date, total_points = generate_burndown_data(active_milestone)
    plot_burndown_chart(active_milestone, ideal_data, actual_data, start_date, end_date, total_points)
    
    print("Burndown chart generation complete")


if __name__ == "__main__":
    main()