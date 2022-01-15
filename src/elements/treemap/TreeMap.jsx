/* eslint-disable @typescript-eslint/no-use-before-define */
import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import {
  selectTreeMap,
  setSelectedArticleId,
  setTreeMap,
} from '../../store/citations/citations';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import ArticleCard from '../cards/ArticleCard';

import './treemap.css';

const TreeMap = () => {
  const dispatch = useAppDispatch();

  const imgHeight = 800;
  const imgWidth = 960;
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const treeMapData = useAppSelector(selectTreeMap);
  const colors = d3.scaleSequential(d3.interpolateSinebow);

  useEffect(
    () => {
      dispatch(setSelectedArticleId(null));
    },
    [dispatch],
  );
  
  useEffect(
    () => {
      if (!treeMapData) {
        dispatch(setTreeMap());
      }
    },
    [dispatch, treeMapData],
  );

  useEffect(
    () => {
      const svgEl = d3.select(svgRef.current);

      if (treeMapData && colors) {
        svgEl
          .selectAll('*')
          .remove();

        const treemap = d3.treemap()
          .size([imgWidth, imgHeight])
          .paddingInner(2);
      
        const root = d3.hierarchy(treeMapData)
          .sum(d => d.citations);

        const journals = root.children.map((node) => node.data.name);
        const journalsWithColorCode = journals.map((journal, index, arr) => ({
          name: journal,
          colorCode: index / (arr.length - 1),
        }));
        
        console.log(treemap(root));

        const tooltip = d3.select(tooltipRef.current).append('div')
          .attr('class', 'tooltip-treemap')
          .style('opacity', 0);

        const cell = svgEl
          .selectAll('g')
          .data(root.leaves())
          .enter()
          .append('g')
          .attr('transform', d => `translate(${d.x0},${d.y0})`);
        
        cell.append('rect')
          .attr('width', d => d.x1 - d.x0)
          .attr('height', d => d.y1 - d.y0)
          .attr('fill', d => {
            const journalColor = journalsWithColorCode.find(
              (journal) => journal.name === d.parent.data.name,
            );
            return colors(journalColor.colorCode);
          })
          .on('mouseover', onMouseOver)
          .on('mouseout', onMouseOut)
          .on('click', onMouseClick);
        
        cell.append('id').text(d => d.data.id);
        
        function onMouseOver(d) {
          d3.select(this).transition().duration('50').attr('opacity', '.6');
          tooltip.transition().duration(50).style('opacity', '1');
          tooltip.html(
            `<div>${d.target.__data__.data.name}</div>
            <div>${d.target.__data__.parent.data.name}</div>`,
          )
            .style('left', (d.pageX + 10) + 'px')
            .style('top', (d.pageY - 15) + 'px');
        }
  
        function onMouseOut() {
          d3.select(this).transition().duration('50').attr('opacity', '1');
          tooltip.transition().duration(50).style('opacity', '0');
        }

        function onMouseClick(e) {
          const nodeId = Number(d3.select(e.target).node().parentNode.getElementsByTagName('id')[0].innerHTML);
          dispatch(setSelectedArticleId(nodeId));
        }
      }
    },
    [colors, dispatch, treeMapData],
  );

  return (
    <Container fluid>
      <Row>
        <Col lg={8}>
          <svg ref={svgRef} width={imgWidth} height={imgHeight} />
        </Col>
        <ArticleCard />
      </Row>
      <div ref={tooltipRef}></div>
    </Container>
  );
};

export default TreeMap;
