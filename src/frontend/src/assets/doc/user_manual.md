# Cortado

| Month    | Savings |
| -------- | ------- |
| January  | $250    |
| February | $80     |
| March    | $420    |

`isDF`

`isDF ws2ws w22`

## Variant Query Language

A valid **Query** is made up of **Activities** and **Operators**, which together form 
expressions that can be linked by logical operators to form more complex queries.
For syntactic reasons, every query ends with a semicolon ; .
Operators come either as unary or binary operators, which express the relationships 
between a single or multiple activities and the variant. As an example for a unary 
operator, the following is a query made from a single unary expression that checks 
if the activity '<span style="color:green">A</span>' is an event happening in the variant.

  <p style="text-align: center;">
    '<span style="color:green">A</span>' 
    <span style="color:rgb(65, 141, 213)">is Contained</span>;
  </p>

Similarly, a query from a binary expression that checks if every 
'<span style="color:green">A</span>'' activity in the variant is followed by a 
'<span style="color:green">B</span>' activity, can be written as:

  <p style="text-align: center;">
    '<span style="color:green">A</span>'
    <span style="color:rgb(65, 141, 213)">is DF</span>
    '<span style="color:green">B</span>'
  </p>

<table class="table table-dark">
  <thead>
    <tr>
      <th>Activities</th>
      <th>Meaning</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>'<span style="color: green;padding: none;inline-size: 12px;">Activity</span>'</td>
      <td>Activity names are written in apostrophes</td>
    </tr>
    <tr>
      <td>
        <span style="white-space: nowrap">
        <span style="color:rgb(65, 141, 213);font-weight: bold">ANY</span> &#123; 
        '<span style="color:green">A</span>', 
        '<span style="color:green">B</span>'}</span>
      </td>
      <td>
        Evaluated in an expression, returns True if any activity for the
        operator returns True
      </td>
    </tr>
    <tr>
      <td>
        <span style="white-space: nowrap">
        <span style="color:rgb(65, 141, 213);font-weight: bold">ALL</span> &#123; 
        '<span style="color:green">A</span>', 
        '<span style="color:green">B</span>'}</span>
      </td>
      <td>
        Evaluated in an expression, returns True if all activities for
        the operator returns True
      </td>
    </tr>
    <tr>
      <td><b>~</b></td>
      <td>
        Written in front of a group; it represents the group consisting of
        all activities besides the activites in the brackets
      </td>
    </tr>
  </tbody>
</table>

Groups can be used both in unary and binary operators to replace single
activities. However, this is restricted to only one side of a binary
expression. In case of binary expressions, if the group is located on
the left-side of the expression, it is evaluated by simply checking for
every member of the group and the right-hand side, if the expression
would be fulfilled. The case of a right-hand side group will be covered
below.

<table class="table table-dark">
  <thead>
    <tr>
      <th>Unary Operator</th>
      <th>Meaning</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <span style="color:rgb(65, 141, 213)"><b>isS</b>tart</span>
      </td>
      <td>Returns True if the activity is a start activity</td>
    </tr>
    <tr>
      <td>
        <span style="color:rgb(65, 141, 213)"><b>isE</b>nd</span>
      </td>
      <td>Returns True if the activity is an end activity</td>
    </tr>
    <tr>
      <td>
        <span style="color:rgb(65, 141, 213)"><b>isC</b>ontained</span>
      </td>
      <td>
        Returns True if the activity is contained inside the variant
      </td>
    </tr>
  </tbody>
</table>

Unary operators express the relationship between a single activity and the 
variant. The following query evaluates to True if 
'<span style="color:green">A</span>' is a start activity of the variant. 
Note that it is not necessarily a unique start activity.

<p style="text-align: center;">
  '<span style="color:green">A</span>'
  <span style="color:rgb(65, 141, 213)">is Start</span>
</p>

For convenience, instead of writing out the full operator name for unary and
binary operators, the letters in bold can be used as a shorthand; thus, we 
can write for example '<span style="color:green">A</span>' 
<span style="color:rgb(65, 141, 213)">isC</span> instead of 
'<span style="color:green">A</span>' 
<span style="color:rgb(65, 141, 213)">isContained</span>.

<table class="table table-dark">
  <thead>
    <tr>
      <th>Binary Operator</th>
      <th>Meaning</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <span style="color:rgb(65, 141, 213)"><b>isD</b>irectly<b>F</b>ollowed</span>
      </td>
      <td>
        Returns True if the right-hand activity always directly-follows
        the left-hand activity
      </td>
    </tr>
    <tr>
      <td>
        <span style="color:rgb(65, 141, 213)"><b>isE</b>ventually<b>F</b>ollowed</span>
      </td>
      <td>
        Returns True if the right-hand activity always follows the
        left-hand activity
      </td>
    </tr>
    <tr>
      <td>
        <span style="color:rgb(65, 141, 213)"><b>isP</b>arallel</span>
      </td>
      <td>
        Returns True if the right-hand activity always happens parallel to
        the left-hand activity
      </td>
    </tr>
  </tbody>
</table>

Binary Operators express the relationship between activities in a variant.
For example, '<span class="activity">A</span>'
<span style="color:rgb(65, 141, 213)">isConcurrent</span> 
'<span style="color:green">B</span>' 
is fulfilled, if every occurrence of '<span style="color:green">A</span>'
happens concurrently to a '<span style="color:green">B</span>' activity. To
add further expressive power, groups can be used on the right-hand side of a 
binary expression to capture some deeper relations. That is the query

<p style="text-align: center;">
  '<span style="color:green">A</span>'
  <span style="color:rgb(65, 141, 213)">isDF </span>
  <span style="color:rgb(65, 141, 213)">ANY</span> &#123; 
  '<span style="color:green">B</span>', 
  '<span style="color:green">C</span>'};
</p>

is fulfilled, if every '<span style="color:green">A</span>' activity is directly 
followed by an '<span style="color:green">B</span>' or 
'<span style="color:green">C</span>' activity. This is different to the 
interpretation of every '<span style="color:green">A</span>' needing to be 
followed by a '<span style="color:green">B</span>' or every
'<span style="color:green">A</span>' being followed by a 
'<span style="color:green">C</span>'

<table class="table table-dark">
  <thead>
    <tr>
      <th>Quantifiers</th>
      <th>Meaning</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>> NUMBER</td>
      <td>
        Returns True if the preceding expression is appears more than
        NUMBER of times
      </td>
    </tr>
    <tr>
      <td>= NUMBER</td>
      <td>
        Returns True if the preceding expression is appears exactly NUMBER
        times
      </td>
    </tr>
    <tr>
      <td>< NUMBER</td>
      <td>
        Returns True if the preceding expression is appears less than
        NUMBER of times
      </td>
    </tr>
  </tbody>
</table>

Quantifiers can be used to check for the frequency of relations. Instead
of checking if '<span class="activity">A</span>' is just contained any
number of times,

<p style="text-align: center;">
  '<span style="color:green">A</span>'
  <span style="color:rgb(65, 141, 213)">isContained</span> > 2
</p>

will only return True, if '<span class="activity">A</span>' appears at least 
3 times in the variant. For binary expressions, this works similarly, thus 
'<span class="activity">A</span>'
<span class="logical-operator">isDF </span> 
'<span class="activity">B</span>' = 2, will return True if 
'<span class="activity">A</span>' is directly-followed 2 times by 
'<span class="activity">B</span>' in the variant. Using Quantifiers in 
conjunction with Groups need some attention, as the right-hand side rules 
also apply here. Thus,

  <p style="text-align: center;">
    '<span style="color:green">A</span>'
    <span style="color:rgb(65, 141, 213)">isDF </span>
    <span style="color:rgb(65, 141, 213)">ALL</span> &#123;
    '<span style="color:green">B</span>', 
    '<span style="color:green">C</span>'} > 1
  </p>

will only be evaluated as True if at least two A activities are followed by 
both a '<span style="color:green">B</span>' and a ''<span style="color:green">C</span>'
activity.

<table class="table table-dark">
  <thead>
    <tr>
      <th>Logical Operator</th>
      <th>Meaning</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span style="color:rgb(65, 141, 213)"><b>AND</b></span></td>
      <td>Returns True if all the expressions are True</td>
    </tr>
    <tr>
      <td><span style="color:rgb(65, 141, 213)"><b>OR</b></span></td>
      <td>Returns True if any of the expressions is True</td>
    </tr>
    <tr>
      <td><span style="color:rgb(65, 141, 213)"><b>NOT</b></span></td>
      <td>
        Returns True if the content of the following expression is False
      </td>
    </tr>
  </tbody>
</table>

Different unary and binary expressions can be linked using logical
      operators to build complex queries. If we for example want to select all
      variants in which activity '<span class="activity">A</span>' is either
      directly followed by activity '<span class="activity">B</span>' or
      eventually followed by activity '<span class="activity">E</span>', we can
      write the following query:

  <p style="text-align: center;">
    '<span style="color:green">A</span>'
    <span style="color:rgb(65, 141, 213)"><b>isDF</b></span>
    '<span style="color:green">B</span>'
    <span style="color:rgb(65, 141, 213)"><b>OR</b></span>
    '<span style="color:green">A</span>'
    <span style="color:rgb(65, 141, 213)"><b>isEF</b></span>
    '<span style="color:green">E</span>'
  </p>

When linking multiple expressions,
<span style="color:rgb(65, 141, 213)"><b>AND</b></span> and
<span style="color:rgb(65, 141, 213)"><b>OR</b></span> operators linking 
expressions can be nested inside each other by using <b> ( ) </b> parenthesis. 
We can use this to expand our previous example by requiring that now every 
'<span style="color:green">A</span>' activity needs to be followed by an 
'<span style="color:green">E</span>' activity and that every 
'<span style="color:green">E</span>' needs to be followed by an 
'<span style="color:green">F</span>' activity:

  <p style="text-align: center;">
    '<span style="color:green">A</span>'
    <span style="color:rgb(65, 141, 213)"><b>isDF</b></span>
    '<span style="color:green">B</span>'
    <span style="color:rgb(65, 141, 213)"><b>OR</b></span>
    '<span style="color:green">A</span>'
    <span style="color:rgb(65, 141, 213)"><b>isEF</b></span>
    '<span style="color:green">E</span>'
  </p>

  <p style="text-align: center;">
    '<span style="color:green">A</span>'
    <span style="color:rgb(65, 141, 213)"><b>isDF</b></span>
    '<span style="color:green">B</span>'
    <span style="color:rgb(65, 141, 213)"><b>OR</b></span>
    ( '<span style="color:green">A</span>'
    <span style="color:rgb(65, 141, 213)"><b>isEF</b></span>
    '<span style="color:green">E</span>'
    <span style="color:rgb(65, 141, 213)"><b>AND</b></span>
    '<span style="color:green">E</span>'
    <span style="color:rgb(65, 141, 213)"><b>isEF</b></span>
    '<span style="color:green">F</span>' );
  </p>

Multiple instances of the same operator on the same level can be linked
without the need of parenthesis.
<span style="color:rgb(65, 141, 213)"><b>NOT</b></span> can be used to negate
the expression written after it in <b> ( ) </b>. As an example, if we want
to get all variants that have '<span class="activity">B</span>' as the
unique and only start activity, we can write the following query:
      
<p style="text-align: center;">
  '<span style="color:green">B</span>'
  <span style="color:rgb(65, 141, 213)"><b>isStart </b></span>
  <span style="color:rgb(65, 141, 213)"><b>AND </b></span>
  <span style="color:rgb(65, 141, 213)"><b>NOT </b></span> ( ~
  <span style="color:rgb(65, 141, 213)"><b>ANY</b></span> &#123; 
  '<span style="color:green">B</span>'} 
  <span style="color:rgb(65, 141, 213)"><b>isStart</b></span> );
</p>

The first term checks if '<span style="color:green">B</span>' is a start
activity, while the second expression would be fulfilled if any activity
that is not '<span style="color:green">B</span>' would be a start activity.
Now, as we negate it, the expression can only be true if 
<span class="activity">B</span>' is a start activity and no other activity 
is a start activity. 

## Section

Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.

### Sub-Section

Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.

### Another Sub-Section

Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. 

#### Deepest section
Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.

# Variant Explorer

Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. 

## Standard View

Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. 


## Performance View

Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. 


## Conformance View

Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. 


## Variant Querying

Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. 

## Infix Selection

Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. 

# Process Model Editor

Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. 
