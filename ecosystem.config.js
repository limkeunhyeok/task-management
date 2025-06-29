module.exports = {
  apps: [
    {
      name: 'scheduler',
      script: './dist/main.js',
      instances: 1, // 'max',
      exec_mode: 'cluster',
      watch: ['./dist/main.js'],
      log_file: './logs/scheduler-out.log', // 통합 로그 파일 경로
      error_file: './logs/scheduler-error.log', // 에러 로그 파일 경로
      out_file: './logs/scheduler-out.log', // 출력 로그 파일 경로
      // merge_logs: true, // 모든 로그를 하나의 파일로 병합
      log_type: 'json',
      env_production: {
        NODE_ENV: 'prod',
      },
      env_development: {
        NODE_ENV: 'dev',
      },
      env_local: {
        NODE_ENV: 'local',
      },
    },
  ],
};
