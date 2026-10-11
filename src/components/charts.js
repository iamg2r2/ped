/**
 * PED PLATFORM - CHART.JS VISUALIZATION CONTROLLER
 * Manages responsive, modern Chart.js instances with sleek dark-theme palettes.
 */

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// Chart defaults for modern dark palette
Chart.defaults.color = '#94a3b8';
Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.95)';
Chart.defaults.plugins.tooltip.borderColor = 'rgba(255, 255, 255, 0.12)';
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.cornerRadius = 8;

export class ChartController {
  constructor() {
    this.deptChart = null;
    this.pedagogyChart = null;
    this.bloomsChart = null;
    this.facultyRadarChart = null;
    this.facultyBloomsChart = null;
  }

  /**
   * Render or update Department-wise Performance Bar Chart
   */
  renderDeptPerformance(canvasId, deptAverages) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.deptChart) {
      this.deptChart.destroy();
    }

    const labels = Object.keys(deptAverages);
    const data = Object.values(deptAverages);

    this.deptChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.map(l => l.length > 22 ? l.slice(0, 20) + '...' : l),
        datasets: [{
          label: 'Mean Quality Score (/100)',
          data: data,
          backgroundColor: data.map(v => v >= 85 ? '#10b981' : (v >= 75 ? '#6366f1' : '#f59e0b')),
          borderRadius: 8,
          borderSkipped: false,
          barPercentage: 0.55
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            min: 40,
            max: 100,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { stepSize: 15 }
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 } }
          }
        }
      }
    });
  }

  /**
   * Render or update Pedagogical Methodologies Doughnut Chart
   */
  renderPedagogyDistribution(canvasId, pedagogyAdoption) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.pedagogyChart) {
      this.pedagogyChart.destroy();
    }

    const labels = Object.keys(pedagogyAdoption);
    const data = Object.values(pedagogyAdoption);

    const colors = [
      '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'
    ];

    this.pedagogyChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 2,
          borderColor: '#111827',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 12,
              padding: 12,
              font: { size: 11 }
            }
          }
        },
        cutout: '68%'
      }
    });
  }

  /**
   * Render or update Bloom's Cognitive Taxonomy Breakdown Chart
   */
  renderBloomsInstitutional(canvasId, bloomsAggregates) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.bloomsChart) {
      this.bloomsChart.destroy();
    }

    const labels = Object.keys(bloomsAggregates);
    const data = Object.values(bloomsAggregates);

    this.bloomsChart = new Chart(ctx, {
      type: 'polarArea',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            'rgba(148, 163, 184, 0.5)', // Remember
            'rgba(56, 189, 248, 0.6)',  // Understand
            'rgba(99, 102, 241, 0.7)',  // Apply
            'rgba(16, 185, 129, 0.75)', // Analyze
            'rgba(245, 158, 11, 0.75)', // Evaluate
            'rgba(236, 72, 153, 0.85)'  // Create
          ],
          borderColor: '#111827',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { boxWidth: 10, font: { size: 11 } }
          }
        },
        scales: {
          r: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { display: false }
          }
        }
      }
    });
  }

  /**
   * Render Individual Faculty 5-Dimension Competency Radar Chart
   */
  renderFacultyRadar(canvasId, criteria) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.facultyRadarChart) {
      this.facultyRadarChart.destroy();
    }

    const labels = [
      'Pedagogy (25)',
      "Bloom's HOTS (25)",
      'OBE Rubrics (20)',
      'ICT Tools (15)',
      'Remedial Loop (15)'
    ];

    // Normalized to percentages 0-100 for balanced radar visual
    const data = [
      (criteria.pedagogyInnovation.score / criteria.pedagogyInnovation.max) * 100,
      (criteria.bloomsAlignment.score / criteria.bloomsAlignment.max) * 100,
      (criteria.obeRubrics.score / criteria.obeRubrics.max) * 100,
      (criteria.ictIntegration.score / criteria.ictIntegration.max) * 100,
      (criteria.remedialImpact.score / criteria.remedialImpact.max) * 100
    ];

    this.facultyRadarChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Faculty Attainment (%)',
          data: data,
          backgroundColor: 'rgba(99, 102, 241, 0.25)',
          borderColor: '#818cf8',
          borderWidth: 2.5,
          pointBackgroundColor: '#818cf8',
          pointBorderColor: '#ffffff',
          pointHoverRadius: 6
        },
        {
          label: 'IQAC Benchmark',
          data: [80, 75, 75, 70, 75],
          backgroundColor: 'transparent',
          borderColor: 'rgba(16, 185, 129, 0.6)',
          borderDash: [4, 4],
          borderWidth: 1.5,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { size: 11 } }
          }
        },
        scales: {
          r: {
            min: 20,
            max: 100,
            ticks: { display: false, stepSize: 20 },
            grid: { color: 'rgba(255, 255, 255, 0.08)' },
            angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
            pointLabels: {
              color: '#cbd5e1',
              font: { size: 11, weight: '600' }
            }
          }
        }
      }
    });
  }

  /**
   * Render Individual Faculty Bloom's Distribution
   */
  renderFacultyBlooms(canvasId, cognitiveBreakdown) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.facultyBloomsChart) {
      this.facultyBloomsChart.destroy();
    }

    const labels = Object.keys(cognitiveBreakdown);
    const data = Object.values(cognitiveBreakdown);

    this.facultyBloomsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Targeted Weight (%)',
          data: data,
          backgroundColor: [
            '#94a3b8', '#38bdf8', '#6366f1', '#10b981', '#f59e0b', '#ec4899'
          ],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            min: 0,
            max: 50,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { stepSize: 10 }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }
}
