from interactive_process_mining_core.utils.split_graph import LeafGroup, ParallelGroup, SequenceGroup

x = SequenceGroup([
        ParallelGroup([
            LeafGroup('vervolgconsult poliklinisch'),
            LeafGroup('administratief tarief       - eerste pol'),
            ])
        ])

d = { x: "test" }

for key in d:
    print(d[key])