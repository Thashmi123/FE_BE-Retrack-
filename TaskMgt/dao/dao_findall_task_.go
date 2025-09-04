// package dao

// import (
// 	"TaskMgt/dbConfig"
// 	"TaskMgt/dto"
// 	"context"
// 	"errors"
// 	"strconv"
// 	"time"

// 	"go.mongodb.org/mongo-driver/bson"
// )

// func DB_FindallTask(page, size, searchTerm, createdBy, assignedTo, status, priority, dueDateFrom, dueDateTo, createdDateFrom, createdDateTo, tag string, noPagination bool) (int64, *[]dto.Task, error) {
// 	var skip int64 = 0
// 	var limit int64 = 0

// 	if !noPagination {
// 		pageInt, err := strconv.Atoi(page)
// 		if err != nil || pageInt < 1 {
// 			return 0, nil, errors.New("invalid page number")
// 		}
// 		sizeInt, err := strconv.Atoi(size)
// 		if err != nil || sizeInt < 1 {
// 			return 0, nil, errors.New("invalid page size")
// 		}
// 		skip = int64((pageInt - 1) * sizeInt)
// 		limit = int64(sizeInt)
// 	}

// 	filter := bson.M{"deleted": false}

// 	// Add filtering conditions
// 	if createdBy != "" {
// 		filter["assigned_by_email"] = createdBy
// 	}
	
// 	if assignedTo != "" {
// 		filter["assigned_to_email"] = assignedTo
// 	}
	
// 	if status != "" {
// 		filter["status"] = status
// 	}
	
// 	if priority != "" {
// 		filter["priority"] = priority
// 	}

// 	// Add tag filtering
// 	if tag != "" {
// 		filter["tags"] = bson.M{"$in": []string{tag}}
// 	}

// 	// Add date range filtering
// 	dateFilter := bson.M{}
// 	if dueDateFrom != "" || dueDateTo != "" {
// 		if dueDateFrom != "" {
// 			if dueDateFromTime, err := time.Parse(time.RFC3339, dueDateFrom); err == nil {
// 				dateFilter["$gte"] = dueDateFromTime
// 			}
// 		}
// 		if dueDateTo != "" {
// 			if dueDateToTime, err := time.Parse(time.RFC3339, dueDateTo); err == nil {
// 				// Add one day to include the entire end date
// 				endOfDay := dueDateToTime.AddDate(0, 0, 1).Add(-time.Nanosecond)
// 				dateFilter["$lte"] = endOfDay
// 			}
// 		}
// 		if len(dateFilter) > 0 {
// 			filter["due_date"] = dateFilter
// 		}
// 	}

// 	if createdDateFrom != "" || createdDateTo != "" {
// 		createdAtFilter := bson.M{}
// 		if createdDateFrom != "" {
// 			if createdDateFromTime, err := time.Parse(time.RFC3339, createdDateFrom); err == nil {
// 				createdAtFilter["$gte"] = createdDateFromTime
// 			}
// 		}
// 		if createdDateTo != "" {
// 			if createdDateToTime, err := time.Parse(time.RFC3339, createdDateTo); err == nil {
// 				// Add one day to include the entire end date
// 				endOfDay := createdDateToTime.AddDate(0, 0, 1).Add(-time.Nanosecond)
// 				createdAtFilter["$lte"] = endOfDay
// 			}
// 		}
// 		if len(createdAtFilter) > 0 {
// 			filter["created_at"] = createdAtFilter
// 		}
// 	}

// 	if searchTerm != "" {
// 		searchConditions := []bson.M{
// 			{"taskid": bson.M{"$regex": searchTerm, "$options": "i"}},
// 			{"title": bson.M{"$regex": searchTerm, "$options": "i"}},
// 			{"description": bson.M{"$regex": searchTerm, "$options": "i"}},
// 			{"duedate": bson.M{"$regex": searchTerm, "$options": "i"}},
// 			{"priority": bson.M{"$regex": searchTerm, "$options": "i"}},
// 			{"status": bson.M{"$regex": searchTerm, "$options": "i"}},
// 		}
// 		filter["$or"] = searchConditions
// 	}

// 	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
// 	defer cancel()

// 	pipeline := []bson.M{
// 		{"$match": filter},
// 		{"$facet": bson.M{
// 			"metadata": []bson.M{{"$count": "total"}},
// 			"data": func() []bson.M {
// 				stages := []bson.M{}

// 				if !noPagination {
// 					stages = append(stages, bson.M{"$skip": skip})
// 					stages = append(stages, bson.M{"$limit": limit})
// 				}

// 				return stages
// 			}(),
// 		}},
// 	}

// 	cursor, err := dbConfig.DATABASE.Collection("Tasks").Aggregate(ctx, pipeline)
// 	if err != nil {
// 		return 0, nil, err
// 	}
// 	defer cursor.Close(ctx)

// 	var results struct {
// 		Metadata []struct {
// 			Total int32 `bson:"total"`
// 		} `bson:"metadata"`
// 		Data []dto.Task `bson:"data"`
// 	}

// 	if cursor.Next(ctx) {
// 		if err := cursor.Decode(&results); err != nil {
// 			return 0, nil, err
// 		}
// 	}

// 	var objects []dto.Task
// 	if len(results.Data) > 0 {
// 		objects = results.Data
// 	} else {
// 		objects = []dto.Task{}
// 	}

// 	var count int64 = 0
// 	if len(results.Metadata) > 0 {
// 		count = int64(results.Metadata[0].Total)
// 	}

// 	return count, &objects, nil
// }

// package dao

// import (
// 	"TaskMgt/dbConfig"
// 	"TaskMgt/dto"
// 	"context"
// 	"errors"
// 	"strconv"
// 	"time"
// 	"go.mongodb.org/mongo-driver/bson"
// )

// type GroupedTasks struct {
// 	Status string     `bson:"_id"`
// 	Tasks  []dto.Task `bson:"tasks"`
// 	Count  int        `bson:"count"`
// }

// func DB_FindallTask(page, size, searchTerm, createdBy, assignedTo, status, priority, dueDateFrom, dueDateTo, createdDateFrom, createdDateTo, tag string, noPagination bool) (int64, *[]dto.Task, error) {
// 	var skip int64 = 0
// 	var limit int64 = 0
// 	if !noPagination {
// 		pageInt, err := strconv.Atoi(page)
// 		if err != nil || pageInt < 1 {
// 			return 0, nil, errors.New("invalid page number")
// 		}
// 		sizeInt, err := strconv.Atoi(size)
// 		if err != nil || sizeInt < 1 {
// 			return 0, nil, errors.New("invalid page size")
// 		}
// 		skip = int64((pageInt - 1) * sizeInt)
// 		limit = int64(sizeInt)
// 	}

// 	// Base filter excludes deleted tasks
// 	filter := bson.M{"deleted": false}

// 	// Add search filter with regex or other filters
// 	if searchTerm != "" {
// 		searchConditions := []bson.M{
// 			{"taskid": bson.M{"$regex": searchTerm, "$options": "i"}},
// 			{"title": bson.M{"$regex": searchTerm, "$options": "i"}},
// 			{"description": bson.M{"$regex": searchTerm, "$options": "i"}},
// 			{"duedate": bson.M{"$regex": searchTerm, "$options": "i"}},
// 			{"priority": bson.M{"$regex": searchTerm, "$options": "i"}},
// 			{"status": bson.M{"$regex": searchTerm, "$options": "i"}},
// 		}
// 		filter["$or"] = searchConditions
// 	}

// 	// Additional filters
// 	if createdBy != "" {
// 		filter["assigned_by_email"] = createdBy
// 	}
// 	if assignedTo != "" {
// 		filter["assigned_to_email"] = assignedTo
// 	}
// 	if status != "" {
// 		filter["status"] = status
// 	}
// 	if priority != "" {
// 		filter["priority"] = priority
// 	}
// 	if tag != "" {
// 		filter["tags"] = bson.M{"$in": []string{tag}}
// 	}

// 	// Date filtering for due date range
// 	dateFilter := bson.M{}
// 	if dueDateFrom != "" {
// 		if dueDateFromTime, err := time.Parse(time.RFC3339, dueDateFrom); err == nil {
// 			dateFilter["$gte"] = dueDateFromTime
// 		}
// 	}
// 	if dueDateTo != "" {
// 		if dueDateToTime, err := time.Parse(time.RFC3339, dueDateTo); err == nil {
// 			endOfDay := dueDateToTime.AddDate(0, 0, 1).Add(-time.Nanosecond)
// 			dateFilter["$lte"] = endOfDay
// 		}
// 	}
// 	if len(dateFilter) > 0 {
// 		filter["due_date"] = dateFilter
// 	}

// 	// Date filtering for created date range
// 	createdAtFilter := bson.M{}
// 	if createdDateFrom != "" {
// 		if createdDateFromTime, err := time.Parse(time.RFC3339, createdDateFrom); err == nil {
// 			createdAtFilter["$gte"] = createdDateFromTime
// 		}
// 	}
// 	if createdDateTo != "" {
// 		if createdDateToTime, err := time.Parse(time.RFC3339, createdDateTo); err == nil {
// 			endOfDay := createdDateToTime.AddDate(0, 0, 1).Add(-time.Nanosecond)
// 			createdAtFilter["$lte"] = endOfDay
// 		}
// 	}
// 	if len(createdAtFilter) > 0 {
// 		filter["created_at"] = createdAtFilter
// 	}

// 	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
// 	defer cancel()

// 	// Construct aggregation pipeline with pagination facets
// 	pipeline := []bson.M{
// 		{"$match": filter},
// 		{"$facet": bson.M{
// 			"metadata": []bson.M{{"$count": "total"}},
// 			"data": func() []bson.M {
// 				stages := []bson.M{}
// 				if !noPagination {
// 					stages = append(stages, bson.M{"$skip": skip})
// 					stages = append(stages, bson.M{"$limit": limit})
// 				}
// 				return stages
// 			}(),
// 		}},
// 	}

// 	cursor, err := dbConfig.DATABASE.Collection("Tasks").Aggregate(ctx, pipeline)
// 	if err != nil {
// 		return 0, nil, err
// 	}
// 	defer cursor.Close(ctx)

// 	var results struct {
// 		Metadata []struct {
// 			Total int32 `bson:"total"`
// 		} `bson:"metadata"`
// 		Data []dto.Task `bson:"data"`
// 	}

// 	if cursor.Next(ctx) {
// 		if err := cursor.Decode(&results); err != nil {
// 			return 0, nil, err
// 		}
// 	}

// 	var objects []dto.Task
// 	if len(results.Data) > 0 {
// 		objects = results.Data
// 	} else {
// 		objects = []dto.Task{}
// 	}

// 	var count int64 = 0
// 	if len(results.Metadata) > 0 {
// 		count = int64(results.Metadata[0].Total)
// 	}

// 	return count, &objects, nil
// }


// v3

package dao

import (
	"TaskMgt/dbConfig"
	"TaskMgt/dto"
	"context"
	"errors"
	"strconv"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

type GroupedTasks struct {
	Status string     `bson:"_id"`
	Tasks  []dto.Task `bson:"tasks"`
	Count  int        `bson:"count"`
}

// parseDate tries RFC3339 and YYYY-MM-DD (HTML date input)
func parseDate(s string) (time.Time, bool) {
	if s == "" {
		return time.Time{}, false
	}
	if t, err := time.Parse(time.RFC3339, s); err == nil {
		return t, true
	}
	if t, err := time.Parse("2006-01-02", s); err == nil {
		return t, true
	}
	return time.Time{}, false
}

// buildTaskFilter constructs a MongoDB filter for tasks.
// Adjust field names here if your dto.Task uses different bson tags.
func buildTaskFilter(
	searchTerm, createdBy, assignedTo, status, priority, tag,
	dueDateFrom, dueDateTo, createdDateFrom, createdDateTo string,
) bson.M {
	filter := bson.M{"deleted": false}

	// Free-text search across string fields (avoid regex on date fields)
	if searchTerm != "" {
		filter["$or"] = []bson.M{
			{"taskid": bson.M{"$regex": searchTerm, "$options": "i"}},
			{"title": bson.M{"$regex": searchTerm, "$options": "i"}},
			{"description": bson.M{"$regex": searchTerm, "$options": "i"}},
			{"priority": bson.M{"$regex": searchTerm, "$options": "i"}},
			{"status": bson.M{"$regex": searchTerm, "$options": "i"}},
		}
	}

	if createdBy != "" {
		filter["assigned_by_email"] = createdBy
	}
	if assignedTo != "" {
		filter["assigned_to_email"] = assignedTo
	}
	if status != "" {
		filter["status"] = status
	}
	if priority != "" {
		filter["priority"] = priority
	}
	if tag != "" {
		// assumes tags: []string
		filter["tags"] = bson.M{"$in": []string{tag}}
	}

	// due_date range
	if from, ok := parseDate(dueDateFrom); ok {
		m, _ := filter["due_date"].(bson.M)
		if m == nil {
			m = bson.M{}
		}
		m["$gte"] = from
		filter["due_date"] = m
	}
	if to, ok := parseDate(dueDateTo); ok {
		m, _ := filter["due_date"].(bson.M)
		if m == nil {
			m = bson.M{}
		}
		end := to.AddDate(0, 0, 1).Add(-time.Nanosecond) // inclusive end-of-day
		m["$lte"] = end
		filter["due_date"] = m
	}

	// created_at range
	if from, ok := parseDate(createdDateFrom); ok {
		m, _ := filter["created_at"].(bson.M)
		if m == nil {
			m = bson.M{}
		}
		m["$gte"] = from
		filter["created_at"] = m
	}
	if to, ok := parseDate(createdDateTo); ok {
		m, _ := filter["created_at"].(bson.M)
		if m == nil {
			m = bson.M{}
		}
		end := to.AddDate(0, 0, 1).Add(-time.Nanosecond)
		m["$lte"] = end
		filter["created_at"] = m
	}

	return filter
}

// DB_FindallTask returns a flat list of tasks (with filters) and the total count.
// Use noPagination=true to return all matched (with sort), otherwise pass page/size.
func DB_FindallTask(
	page, size string,
	searchTerm, createdBy, assignedTo, status, priority,
	dueDateFrom, dueDateTo, createdDateFrom, createdDateTo, tag string,
	noPagination bool,
) (int64, *[]dto.Task, error) {

	var skip int64 = 0
	var limit int64 = 0
	if !noPagination {
		pageInt, err := strconv.Atoi(page)
		if err != nil || pageInt < 1 {
			return 0, nil, errors.New("invalid page number")
		}
		sizeInt, err := strconv.Atoi(size)
		if err != nil || sizeInt < 1 {
			return 0, nil, errors.New("invalid page size")
		}
		skip = int64((pageInt - 1) * sizeInt)
		limit = int64(sizeInt)
	}

	filter := buildTaskFilter(
		searchTerm, createdBy, assignedTo, status, priority, tag,
		dueDateFrom, dueDateTo, createdDateFrom, createdDateTo,
	)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Always sort to make pagination stable
	dataStages := []bson.M{
		{"$sort": bson.M{"created_at": -1, "_id": -1}},
	}
	if !noPagination {
		dataStages = append(dataStages, bson.M{"$skip": skip}, bson.M{"$limit": limit})
	}

	pipeline := []bson.M{
		{"$match": filter},
		{"$facet": bson.M{
			"metadata": []bson.M{{"$count": "total"}},
			"data":     dataStages,
		}},
	}

	cursor, err := dbConfig.DATABASE.Collection("Tasks").Aggregate(ctx, pipeline)
	if err != nil {
		return 0, nil, err
	}
	defer cursor.Close(ctx)

	var out struct {
		Metadata []struct {
			Total int64 `bson:"total"`
		} `bson:"metadata"`
		Data []dto.Task `bson:"data"`
	}

	if cursor.Next(ctx) {
		if err := cursor.Decode(&out); err != nil {
			return 0, nil, err
		}
	}

	var count int64
	if len(out.Metadata) > 0 {
		count = out.Metadata[0].Total
	}

	items := out.Data
	return count, &items, nil
}

// DB_FindallTaskGroupedByStatus returns tasks grouped by status with per-group counts.
// limitPerGroup: 0 = return all tasks per group; >0 = slice tasks per group to this number.
func DB_FindallTaskGroupedByStatus(
	searchTerm, createdBy, assignedTo, status, priority,
	dueDateFrom, dueDateTo, createdDateFrom, createdDateTo, tag string,
	limitPerGroup int,
) (int64, *[]GroupedTasks, error) {

	filter := buildTaskFilter(
		searchTerm, createdBy, assignedTo, status, priority, tag,
		dueDateFrom, dueDateTo, createdDateFrom, createdDateTo,
	)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	groupStages := []bson.M{
		{"$group": bson.M{
			"_id":   "$status",
			"tasks": bson.M{"$push": "$$ROOT"},
			"count": bson.M{"$sum": 1},
		}},
		// sort groups by status for consistent output
		{"$sort": bson.M{"_id": 1}},
	}

	if limitPerGroup > 0 {
		groupStages = append(groupStages, bson.M{
			"$project": bson.M{
				"_id":   1,
				"count": 1,
				"tasks": bson.M{"$slice": []interface{}{"$tasks", limitPerGroup}},
			},
		})
	}

	pipeline := []bson.M{
		{"$match": filter},
		{"$facet": bson.M{
			"groups": groupStages,
			"meta":   []bson.M{{"$count": "total"}},
		}},
	}

	cursor, err := dbConfig.DATABASE.Collection("Tasks").Aggregate(ctx, pipeline)
	if err != nil {
		return 0, nil, err
	}
	defer cursor.Close(ctx)

	var out struct {
		Groups []GroupedTasks `bson:"groups"`
		Meta   []struct {
			Total int64 `bson:"total"`
		} `bson:"meta"`
	}

	if cursor.Next(ctx) {
		if err := cursor.Decode(&out); err != nil {
			return 0, nil, err
		}
	}

	var total int64
	if len(out.Meta) > 0 {
		total = out.Meta[0].Total
	}
	groups := out.Groups
	return total, &groups, nil
}

