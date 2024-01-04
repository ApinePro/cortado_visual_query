
# Contribution Guidelines
Internal Notes (remove or move to different location before publication)

## Creating Screenshots
Screenshots can be captured consistently by using the fixed cortado window of electron. 

### Screenshot without border
![clustering_dialog.png](screenshots%2Fvariant_handling%2Fvariant_clustering%2Fclustering_dialog.png)

### Screenshot with border
|![clustered_variant_explorer.png](screenshots%2Fvariant_handling%2Fvariant_clustering%2Fclustered_variant_explorer.png)|
-

&nbsp;

* Ideas for referring to buttons / icons:
  * Examples:
    * Use (<i class="bi bi-diagram-2-fill btn-icon">discover initial model</i>) button to discover an initial model.
    * Click `Files` &rarr; <i class="bi bi-file-earmark-arrow-up btn-icon"></i>`Import process tree (.ptml)` to import an existing process tree from a file.


# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5


# Introduction
* What is Cortado about
* General high-level ideas behind the tool
* Contact info etc. and references to publications 


# Variant Handling

## Variant Explorer
Selected (marked with <i class="bi bi-check2-circle"></i>) <b>non-fitting</b> variants will be added to the process model. 

Selected (marked with <i class="bi bi-check2-circle"></i>) <b>fitting</b> variants will remain in the process tree's language when incrementally adding new variants.

* Variants (high-level variants)
* Low-level Variants (Subvariants)
* Sorting Variants



## Variant Clustering

Variant clustering can be used for listing the variants grouped into clusters in the Variant Explorer view. This allows for a convenient way to organize and access similar variants in their respective clusters.

In the Variant Explorer view, clustering settings can be accessed using <i class="bi bi-grid-1x2 btn-icon"></i>`Variant clustering settings` option in the <i class="bi bi-tools btn-icon"></i>`Functions` dropdown menu. 

|![clustered_variant_explorer.png](screenshots%2Fvariant_handling%2Fvariant_clustering%2Fclustering_dialog.png)|
-

### Clustering Methods
The Clustering Method dropdown allows for selection of the clustering method. The following clustering techniques are included:

#### Agglomerative edit distance clustering: 
- Using this technique, variants are represented as trees and their edit distances are pairwise compared and used as a distance measure between variants during clustering.
- Having selected `Agglomerative edit distance clustering`, the second input field can be used to specify the `Max. Variant Edit Distance Within a Cluster`

#### Label vector clustering:
- Using this technique, vectored labels of activities in variants are used for clustering. The ordering of the labels are ignored.
- Having selected `Label vector clustering`, the second input field can be used to specify the `Number of Clusters`

&nbsp;

After selection of the desired settings, click <i class="bi bi-save btn-icon"></i>`Apply` to apply the settings and cluster all variants in Variant Explorer. 

<i class="bi bi-arrow-clockwise btn-icon"></i>`Reset` can be used to discard the clusters and restore to the default list of variants.

### Cluster Information
After applying clustering, variants are grouped in their respective clusters as shown below:
- Using the <i class="bi bi-chevron-down btn-icon"></i> toggle, each cluster can be hidden or expanded.
- Using <i class="bi bi-sort-alpha-down btn-icon"></i>, each cluster can be individually sorted. Note that using the global sorting of Variant Explorer view overrides the sorting of individual clusters.
- Each cluster information bar shows the number of variants and the number traces in that cluster. 

|![clustered_variant_explorer.png](screenshots%2Fvariant_handling%2Fvariant_clustering%2Fclustered_variant_explorer.png)|
-


## Variant Querying
A valid **Query** is made up of **Activities** and **Operators**, which together form 
expressions that can be linked by logical operators to form more complex queries.
For syntactic reasons, ev**ery query ends with a semicolon ; .
Operators come either as unary or binary operators, which express the relationships 
between a single or multiple activities and the variant. As an example for a unary 
operator, the following is a query made from a single unary expression that checks 
if the activity `'A'` is an event happening in the variant.

`'A' is Contained`

Similarly, a query from a binary expression that checks if every 
`'A'` activity in the variant is followed by a `'B'` activity, can be written as:

`'A' is DF 'B'`

| Activities                           | Meaning                                                                                                                 |
|--------------------------------------|-------------------------------------------------------------------------------------------------------------------------|
| `'Activity'`                         | Activity names are written in apostrophes                                                                               |
| `ANY{'A','B'}`     | Evaluated in an expression, returns True if any activity for the operator returns True                                  |
| `ALL{'A','B'}`                       | Evaluated in an expression, returns True if all activities for the operator returns True                                |
| `~`                                  | Written in front of a group; it represents the group consisting of all activities besides the activites in the brackets |



Groups can be used both in unary and binary operators to replace single
activities. However, this is restricted to only one side of a binary
expression. In case of binary expressions, if the group is located on
the left-side of the expression, it is evaluated by simply checking for
every member of the group and the right-hand side, if the expression
would be fulfilled. The case of a right-hand side group will be covered
below.


| Unary Operator     | Meaning                                                      |
|:-------------------------------------|--------------------------------------------------------------|
| `isStart`                            | Returns True if the activity is a start activity             |
| `isEnd`                              | Returns True if the activity is an end activity              |
| `isContained`                        | Returns True if the activity is contained inside the variant |



Unary operators express the relationship between a single activity and the 
variant. The following query evaluates to True if `'A'` is a start activity of the variant. 
Note that it is not necessarily a unique start activity.

`'A' is Start`

For convenience, instead of writing out the full operator name for unary and
binary operators, the letters in bold can be used as a shorthand; thus, we 
can write for example `'A' isC` instead of `'A' isContained`.

| Binary Operator                               | Meaning                                                                                   |
|-----------------------------------------------|-------------------------------------------------------------------------------------------|
| `isDirectlyFollowed`                          | Returns True if the right-hand activity always directly-follows the left-hand activity    |
| `isEventuallyFollowed`      | Returns True if the right-hand activity always follows the left-hand activity             |
| `isParallel`                                  | Returns True if the right-hand activity always happens parallel to the left-hand activity |



Binary Operators express the relationship between activities in a variant.
For example, `'A' isConcurrent 'B'` is fulfilled, if every occurrence of 
`'A'` happens concurrently to a `'B'` activity. To add further expressive power, groups can be 
used on the right-hand side of a binary expression to capture some deeper relations. 
That is the query

`'A' isDF ANY {'B','C'};`

is fulfilled, if every `'A'` activity is directly followed by an `'B'` or `'C'` activity. 
This is different to the interpretation of every `'A'` needing to be followed by a `'B'` 
or every `'A'` being followed by a `'C'`

| Quantifiers     | Meaning                                                                         |
|-----------------------------------|---------------------------------------------------------------------------------|
| `> NUMBER`                        | Returns True if the preceding expression is appears more than NUMBER of times   |
| `= NUMBER`                        | Returns True if the preceding expression is appears exactly NUMBER times        |
| `< NUMBER`                        | Returns True if the preceding expression is appears less than NUMBER of times   |



Quantifiers can be used to check for the frequency of relations. Instead
of checking if `'A'` is just contained any
number of times,

`'A' isContained > 2`

will only return True, if `'A'` appears at least 3 times in the variant. For binary expressions, 
this works similarly, thus `'A' isDF 'B' = 2`, will return True if `'A'` is directly-followed 2 
times by `'B'` in the variant. Using Quantifiers in conjunction with Groups need some attention, 
as the right-hand side rules also apply here. Thus,

`'A' isDF ALL { 'B', 'C'} > 1`

will only be evaluated as True if at least two A activities are followed by both a `'B'` and a 
`'C'` activity.

| Logical Operator      | Meaning                                                           |
|-----------------------------------------|-------------------------------------------------------------------|
| `AND`                                   | Returns True if all the expressions are True                      |
| `OR`                                    | Returns True if any of the expressions is True                    |
| `NOT`                                   | Returns True if the content of the following expression is False  |



Different unary and binary expressions can be linked using logical operators to build complex 
queries. If we for example want to select all variants in which activity `'A'` is either
directly followed by activity `'B'` or eventually followed by activity `'E'`, we can write the 
following query:

`'A' isDF 'B' OR 'A' isEF 'E'`

When linking multiple expressions, `AND` and `OR` operators linking expressions can be nested 
inside each other by using <b> ( ) </b> parenthesis. We can use this to expand our previous 
example by requiring that now every `'A'` activity needs to be followed by an`'E'` activity and 
that every `'E'` needs to be followed by an `'F'` activity:

`'A' isDF 'B' OR 'A' isEF 'E'`

`'A' isDF 'B' OR ( 'A' isEF 'E' AND 'E' isEF 'F' );`

Multiple instances of the same operator on the same level can be linked without the need of 
parenthesis. `NOT` can be used to negate the expression written after it in <b> ( ) </b>. 
As an example, if we want to get all variants that have `'B'` as the unique and only start 
activity, we can write the following query:

`'B' isStart AND NOT ( ~ ANY {'B'} isStart );`

The first term checks if `'B'` is a start activity, while the second expression would be 
fulfilled if any activity that is not `'B'` would be a start activity. Now, as we negate it, 
the expression can only be true if `'B'` is a start activity and no other activity 
is a start activity.



## Variant Fragments
* Variant prefixes, infixes, postfixes
* Extracting 	 



## Variant Modeler



## Variant Frequent Pattern Mining 



## Variant Sequentialization (Tiebreaker) 





# Process Discovery 



## Visualizing & Editing Process Models
* Process Tree Editor
  * Selecting Nodes for Updates
  * Inserting Nodes
  * Replacing Nodes
  * Removing Nodes
  * Shifting Nodes
  * Applying Reduction Rules
  * (Un)Freezing Subtrees
  * Undo/Redo Applied Changes
  * Exporting the Model
* BPMN-Visualizer
  * Selecting Nodes for Updates
  * Removing Nodes
  * Exporting the Model



## Incremental Process Discovery
* Idea and Overview
* Discovering Initial Model
* Incrementally Adding Traces




# Temporal Performance Analysis
* Model-independent performance analysis
* Model-based performance analysis 




 
# Software Architecture



