export function getSeconds(time: string): number {
  let seconds = 0

  const days = time.match(/(\d+)\s*d/);
  const hours = time.match(/(\d+)\s*h/);
  const minutes = time.match(/(\d+)\s*m/);

  if (days) { seconds += parseInt(days[1])*86400; }
  if (hours) { seconds += parseInt(hours[1])*3600; }
  if (minutes) { seconds += parseInt(minutes[1])*60; }

  return seconds;
}

export function miliToMinutes(time: number): string {
  let minutes = Math.floor(time / 60000);
  let seconds = ((time % 60000) / 1000).toFixed(0);

  if (seconds === '60') {
    seconds = '0';
    minutes++;
  }

  return `${minutes}:${parseInt(seconds) < 10 ? '0' : ''}${seconds}`;
}