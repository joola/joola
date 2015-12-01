_agg.total += 1;

if (doc['context_loaded_events_count'].value > 0 && doc['thumbnails_clicked_events_count'].value > 0) { 
	_agg.watched += 1;
} 
else if (doc['context_loaded_events_count'].value == 0 && doc['thumbnails_clicked_events_count'].value > 0) { 
	_agg.notwatched += 1;
};
