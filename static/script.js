let treeData = {
    name: "Metazoa",
    children: [],
    _collapsed: false
};

const width = 900;
const height = 600;

const svg = d3.select("#tree")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

function update() {
    svg.selectAll("*").remove();

    const root = d3.hierarchy(treeData, d => {
        // 👇 hide children if collapsed
        return d._collapsed ? null : d.children;
    });

    const treeLayout = d3.tree().size([width - 200, height - 200]);
    treeLayout(root);

    // LINKS
    svg.selectAll("line")
        .data(root.links())
        .enter()
        .append("line")
        .attr("x1", d => d.source.x + 100)
        .attr("y1", d => d.source.y + 100)
        .attr("x2", d => d.target.x + 100)
        .attr("y2", d => d.target.y + 100)
        .attr("stroke", "#555");

    // NODES
    const nodes = svg.selectAll("g")
        .data(root.descendants())
        .enter()
        .append("g")
        .attr("transform", d => `translate(${d.x + 100},${d.y + 100})`);

    nodes.append("rect")
        .attr("width", 120)
        .attr("height", 35)
        .attr("x", -60)
        .attr("y", -18)
        .attr("fill", d => d.data._collapsed ? "#999" : "lightblue")
        .attr("stroke", "black")
        .attr("cursor", "pointer")

        // ➕ CLICK = ADD CHILD
        .on("click", function(event, d) {
            event.stopPropagation();

            let name = prompt("Enter child node name:");
            if (!name) return;

            if (!d.data.children) d.data.children = [];

            d.data.children.push({
                name,
                children: [],
                _collapsed: false
            });

            update();
        })

        // ✏️ DOUBLE CLICK = RENAME
        .on("dblclick", function(event, d) {
            event.stopPropagation();

            let newName = prompt("Rename node:", d.data.name);
            if (!newName) return;

            d.data.name = newName;
            update();
        })

        // 🗑 RIGHT CLICK = DELETE
        .on("contextmenu", function(event, d) {
            event.preventDefault();
            event.stopPropagation();

            if (d.depth === 0) {
                alert("Cannot delete root node");
                return;
            }

            deleteNode(treeData, d.data.name);
            update();
        })

        // 👇 HOLD CLICK = COLLAPSE/EXPAND
        .on("mousedown", function(event, d) {
            d._holdTimer = setTimeout(() => {
                d.data._collapsed = !d.data._collapsed;
                update();
            }, 500); // hold for 500ms
        })

        .on("mouseup", function(event, d) {
            clearTimeout(d._holdTimer);
        });

    // TEXT
    nodes.append("text")
        .text(d => d.data.name)
        .attr("text-anchor", "middle")
        .attr("dy", 5)
        .attr("fill", "black")
        .style("pointer-events", "none");
}


// 🗑 DELETE NODE HELPER
function deleteNode(node, targetName) {
    if (!node.children) return;

    node.children = node.children.filter(c => c.name !== targetName);

    node.children.forEach(c => deleteNode(c, targetName));
}

update();