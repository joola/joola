uplift = 0;
watched = 0;
notwatched = 0;
total = 0;

for (a in _aggs) { 
	watched += a.watched;
	notwatched += a.notwatched;
	total += a.total;
}; 

watched_rate = watched / total;
notwatched_rate = notwatched / total;

if (notwatched_rate > 0) {
	uplift = ( (watched / total) / (notwatched / total) ) - 1;
} 

return uplift;
