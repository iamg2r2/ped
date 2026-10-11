/**
 * PED PLATFORM - CHART.JS VISUALIZATION CONTROLLER
 * St. Joseph's College IQAC Analytics
 * Multi-dimensional visualizations for Departments and Faculty.
 */

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// Chart styling defaults
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
    this.assessTypeChart = null;
    this.facultyRadarChart = null;
  }

  /**
   * Render Department Comparison Bar Chart (Dual bars: Annexure 9b vs 9c)
   */
  renderDeptComparison(canvasId, deptStats) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.deptChart) {
      this.deptChart.destroy();
    }

    const labels = Object.keys(deptStats);
    const data9b = labels.map(k => deptStats[k].avg9b);
    const data9c = labels.map(k => deptStats[k].avg9c);

    this.deptChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Annexure 9(b) Pedagogy Score',
            data: data9b,
            backgroundColor: '#6366f1',
            borderRadius: 6,
            barPercentage: 0.7
          },
          {
            label: 'Annexure 9(c) Assessment Score',
            data: data9c,
            backgroundColor: '#10b981',
            borderRadius: 6,
            barPercentage: 0.7
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { boxWidth: 12, font: { size: 11 } }
          }
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
   * Render Pedagogical Practices Doughnut Chart
   */
  renderPedagogyDistribution(canvasId, facultyRecords) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.pedagogyChart) {
      this.pedagogyChart.destroy();
    }

    const counts = {};
    facultyRecords.forEach(f => {
      const method = f.annexure9b?.teachingMethod || "Active Learning";
      const key = method.split('&')[0].trim();
      counts[key] = (counts[key] || 0) + 1;
    });

    const labels = Object.keys(counts);
    const data = Object.values(counts);
    const colors = ['#6366f1', '#10b981', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6'];

    this.pedagogyChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: '#111827',
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { boxWidth: 12, padding: 10, font: { size: 11 } }
          }
        },
        cutout: '65%'
      }
    });
  }

  /**
   * Render Assessment Types Breakdown (Summative vs Formative vs Alternative)
   */
  renderAssessmentTypes(canvasId, facultyRecords) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.assessTypeChart) {
      this.assessTypeChart.destroy();
    }

    let summative = 0, formative = 0, alternative = 0;
    facultyRecords.forEach(f => {
      if (f.annexure9c?.components) {
        f.annexure9c.components.forEach(c => {
          const t = (c.type || "").toLowerCase();
          if (t.includes("summat")) summative++;
          else if (t.includes("format")) formative++;
          else if (t.includes("alternat") || t.includes("project") || t.includes("sprint")) alternative++;
        });
      }
    });

    this.assessTypeChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Summative Assessments (CIA)', 'Formative In-Class Checks', 'Alternative Assessments (Projects/Sprints)'],
        datasets: [{
          data: [summative, formative, alternative],
          backgroundColor: ['#3b82f6', '#06b6d4', '#10b981'],
          borderColor: '#111827',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, font: { size: 11 } }
          }
        }
      }
    });
  }

  /**
   * Render Individual Faculty Radar Chart comparing 9(b) and 9(c) against benchmarks
   */
  renderFacultyRadar(canvasId, faculty) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.facultyRadarChart) {
      this.facultyRadarChart.destroy();
    }

    const b = faculty.annexure9b?.criteria || {
      methodInnovation: { score: 20, max: 25 },
      planningPurpose: { score: 16, max: 20 },
      inClassDelivery: { score: 16, max: 20 },
      impact: { score: 16, max: 20 },
      reflection: { score: 12, max: 15 }
    };

    const c = faculty.annexure9c?.criteria || {
      varietyBalance: { score: 20, max: 25 },
      coCoverage: { score: 20, max: 25 },
      transparency: { score: 16, max: 20 },
      feedback: { score: 12, max: 15 },
      reflection: { score: 12, max: 15 }
    };

    const labels = [
      'Pedagogical Innovation',
      'In-Class Student Flow',
      'Learning Impact Evidence',
      'Assessment Variety (9c)',
      'CO Alignment (9c)',
      'Critical Reflection'
    ];

    const data = [
      (b.methodInnovation.score / b.methodInnovation.max) * 100,
      (b.inClassDelivery.score / b.inClassDelivery.max) * 100,
      (b.impact.score / b.impact.max) * 100,
      (c.varietyBalance.score / c.varietyBalance.max) * 100,
      (c.coCoverage.score / c.coCoverage.max) * 100,
      ((b.reflection.score + c.reflection.score) / (b.reflection.max + c.reflection.max)) * 100
    ];

    this.facultyRadarChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [
          {
            label: `${faculty.facultyName} Attainment (%)`,
            data: data,
            backgroundColor: 'rgba(99, 102, 241, 0.25)',
            borderColor: '#818cf8',
            borderWidth: 2.5,
            pointBackgroundColor: '#818cf8'
          },
          {
            label: 'IQAC College Benchmark (75%)',
            data: [75, 75, 75, 75, 75, 75],
            backgroundColor: 'transparent',
            borderColor: 'rgba(16, 185, 129, 0.6)',
            borderDash: [4, 4],
            borderWidth: 1.5,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 11 } } }
        },
        scales: {
          r: {
            min: 30,
            max: 100,
            ticks: { display: false, stepSize: 20 },
            grid: { color: 'rgba(255, 255, 255, 0.08)' },
            angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
            pointLabels: {
              color: '#cbd5e1',
              font: { size: 10.5, weight: '600' }
            }
          }
        }
      }
    });
  }
}
